#!/usr/bin/env bash
# =============================================================================
#  KARMAN · карманная Linux-среда — лаунчер для Linux-хоста
#
#  Это «программа-помощник» на самом накопителе. Она ничего не устанавливает
#  в систему: проверяет раскладку, целостность образа и запускает QEMU
#  с Linux-средой с этого же SSD.
#
#  Использование:
#     ./ЗАПУСТИТЬ-КАРМАН.sh                меню
#     ./ЗАПУСТИТЬ-КАРМАН.sh start          запустить Linux
#     ./ЗАПУСТИТЬ-КАРМАН.sh verify         только проверки
#     ./ЗАПУСТИТЬ-КАРМАН.sh checkpoint     контрольная точка
#     ./ЗАПУСТИТЬ-КАРМАН.sh restore [имя]  восстановить из точки
#     ./ЗАПУСТИТЬ-КАРМАН.sh reset          сбросить систему к base
#     ./ЗАПУСТИТЬ-КАРМАН.sh eject          безопасно отключить накопитель
#     флаги: --dry-run  --writable-data
# =============================================================================

set -u

ACTION="menu"
DRY_RUN=0
WRITABLE_DATA=0
RESTORE_NAME=""

for arg in "$@"; do
    case "$arg" in
        start|verify|checkpoint|restore|reset|eject|menu) ACTION="$arg" ;;
        --dry-run) DRY_RUN=1 ;;
        --writable-data) WRITABLE_DATA=1 ;;
        -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
        *) RESTORE_NAME="$arg" ;;
    esac
done

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KARMAN_DIR="$ROOT/karman"
MANIFEST="$KARMAN_DIR/manifest.json"
LOG_DIR="$KARMAN_DIR/logs"
LOG_FILE=""
LAUNCHER_VERSION="1.0.0"

C_CYAN=$'\033[36m'; C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'
C_RED=$'\033[31m'; C_GRAY=$'\033[90m'; C_OFF=$'\033[0m'
# в перенаправленный вывод не подмешиваем escape-последовательности
if [ ! -t 1 ]; then C_CYAN=""; C_GREEN=""; C_YELLOW=""; C_RED=""; C_GRAY=""; C_OFF=""; fi

mkdir -p "$LOG_DIR" 2>/dev/null || true
LOG_FILE="$LOG_DIR/session-$(date +%Y%m%d-%H%M%S).log"

log() {
    local level="$1"; shift
    local msg="$*"
    local color="$C_GRAY"
    case "$level" in
        OK) color="$C_GREEN" ;;
        WARN) color="$C_YELLOW" ;;
        ERROR) color="$C_RED" ;;
    esac
    printf '  [%s%-5s%s] %s\n' "$color" "$level" "$C_OFF" "$msg"
    printf '%s %-5s %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$level" "$msg" >> "$LOG_FILE" 2>/dev/null || true
}

banner() {
    echo
    echo "${C_CYAN}  KARMAN · Карман · Linux-среда с внешнего SSD${C_OFF}"
    echo "${C_GRAY}  накопитель: $ROOT${C_OFF}"
    echo "${C_GRAY}  ────────────────────────────────────────────────────────${C_OFF}"
}

die() { log ERROR "$*"; echo; log WARN 'напоминание: шифрования нет — содержимое накопителя прочитает любой'; exit 1; }

need_python() {
    command -v python3 >/dev/null 2>&1 || die 'нужен python3 для чтения manifest.json (поставь пакет python3)'
}

read_manifest() {
    python3 - "$MANIFEST" <<'PY'
import json, shlex, sys
path = sys.argv[1]
try:
    m = json.load(open(path, encoding='utf-8'))
except Exception as exc:
    sys.stderr.write(f'manifest.json не читается: {exc}\n')
    raise SystemExit(4)

def g(*keys, default=''):
    cur = m
    for k in keys:
        if not isinstance(cur, dict) or k not in cur:
            return default
        cur = cur[k]
    return cur if cur is not None else default

values = {
    'M_LAYOUT': g('layout', default=0),
    'M_BASE': g('system', 'base', default='karman/system/base.qcow2'),
    'M_OVERLAY': g('state', 'overlay', default='karman/state/overlay.qcow2'),
    'M_DATA': g('data', 'dir', default='data'),
    'M_CHECKPOINTS': g('checkpoints', 'dir', default='karman/checkpoints'),
    'M_VERIFY': g('verify', default='sha256'),
    'M_SHA': g('system', 'sha256', default=''),
    'M_SIZE': g('system', 'size', default=0),
    'M_QEMU': g('engine', 'qemu', 'linux', default='karman/engine/qemu/qemu-system-x86_64'),
    'M_QEMU_IMG': g('engine', 'qemu', 'qemu_img_linux', default='karman/engine/qemu/qemu-img'),
    'M_MEMORY': g('vm', 'memory_mb', default=4096),
    'M_CPUS': g('vm', 'cpus', default=4),
    'M_MAXPOINTS': g('checkpoints', 'max', default=5),
    'M_MINFREE': g('checkpoints', 'min_free_gb', default=8),
    'M_SHARE': g('vm', 'share_data', default='ro'),
}
for key, value in values.items():
    print(f'{key}={shlex.quote(str(value))}')
PY
}

FREE_KB=0
free_space_kb() {
    FREE_KB=$(df -Pk "$ROOT" 2>/dev/null | awk 'NR==2 {print $4}')
    [ -n "${FREE_KB:-}" ] || FREE_KB=0
}

ISSUES=0
PROBLEMS=""
WARNINGS=""
problem() { ISSUES=$((ISSUES+1)); PROBLEMS="$PROBLEMS$1"$'\n'; log ERROR "$1"; }
warning() { WARNINGS="$WARNINGS$1"$'\n'; log WARN "$1"; }

resolve_qemu() {
    if [ -x "$ROOT/$M_QEMU" ]; then
        QEMU_BIN="$ROOT/$M_QEMU"
    elif command -v qemu-system-x86_64 >/dev/null 2>&1; then
        QEMU_BIN="$(command -v qemu-system-x86_64)"
        warning "портативный QEMU не найден в karman/engine/qemu — использую системный $QEMU_BIN"
    else
        QEMU_BIN=""
        problem "нет QEMU: положи портативную сборку в karman/engine/qemu/ или поставь qemu-system-x86_64"
    fi
}

resolve_qemu_img() {
    if [ -x "$ROOT/$M_QEMU_IMG" ]; then
        QEMU_IMG="$ROOT/$M_QEMU_IMG"
    elif command -v qemu-img >/dev/null 2>&1; then
        QEMU_IMG="$(command -v qemu-img)"
    else
        QEMU_IMG=""
    fi
}

sha256_of() {
    if command -v sha256sum >/dev/null 2>&1; then
        sha256sum "$1" | awk '{print $1}'
    else
        shasum -a 256 "$1" | awk '{print $1}'
    fi
}

human_gb() { awk -v kb="$1" 'BEGIN {printf "%.1f", kb/1048576}'; }

run_preflight() {
    ISSUES=0; PROBLEMS=""; WARNINGS=""
    BASE="$ROOT/$M_BASE"
    OVERLAY="$ROOT/$M_OVERLAY"
    DATA_DIR="$ROOT/$M_DATA"
    CHECKPOINT_DIR="$ROOT/$M_CHECKPOINTS"
    LOCK="$KARMAN_DIR/state/session.lock"

    if [ "$M_LAYOUT" != "1" ]; then
        problem "версия раскладки '$M_LAYOUT' не поддерживается (ожидается 1)"
    fi

    resolve_qemu
    resolve_qemu_img

    if [ ! -f "$BASE" ]; then
        problem "нет образа системы: $BASE (см. README раздела pocket-linux)"
    else
        local actual_size actual_hash
        actual_size=$(stat -c%s "$BASE" 2>/dev/null || stat -f%z "$BASE")
        if [ "$M_SIZE" != "0" ] && [ "$actual_size" != "$M_SIZE" ]; then
            problem "размер образа не совпадает с манифестом: $actual_size вместо $M_SIZE байт"
        fi
        if [ "$M_VERIFY" = "sha256" ] && [ -n "$M_SHA" ]; then
            actual_hash=$(sha256_of "$BASE")
            if [ "$actual_hash" != "$M_SHA" ]; then
                problem "sha256 образа не совпадает (получен ${actual_hash:0:12}…) — запуск отменён"
            fi
        elif [ "$M_VERIFY" = "sha256" ]; then
            warning 'в манифесте не задан sha256 образа — целостность не проверяется'
        fi
    fi

    free_space_kb
    local min_kb free_gb
    min_kb=$(awk -v gb="$M_MINFREE" 'BEGIN {printf "%d", gb*1048576}')
    free_gb=$(human_gb "$FREE_KB")
    if [ "$FREE_KB" -lt "$min_kb" ]; then
        problem "свободно $free_gb ГБ, нужно минимум $M_MINFREE ГБ (оверлей и контрольная точка)"
    fi

    [ -d "$DATA_DIR" ] || warning "нет каталога общих файлов $DATA_DIR"
    [ -f "$LOCK" ] && warning 'есть session.lock: прошлая сессия завершилась нештатно, последние изменения могли потеряться'
    [ -f "$OVERLAY" ] || warning 'оверлея нет — будет создан при первом запуске'
}

show_preflight() {
    if [ "$ISSUES" -eq 0 ]; then
        log OK "проверки пройдены, свободно $(human_gb "$FREE_KB") ГБ"
    fi
    log WARN 'напоминание: шифрования нет — любой, кто подключит накопитель, прочитает всё содержимое'
}

create_overlay() {
    [ -f "$OVERLAY" ] && return 0
    [ -n "$QEMU_IMG" ] || die "оверлея нет, а qemu-img не найден: $ROOT/$M_QEMU_IMG"
    if [ "$DRY_RUN" -eq 1 ]; then
        log INFO "DRY-RUN: создал бы оверлей $OVERLAY на базе $BASE"
        return 0
    fi
    mkdir -p "$(dirname "$OVERLAY")"
    # qemu-img -b принимает путь относительно каталога оверлея
    ( cd "$(dirname "$OVERLAY")" && "$QEMU_IMG" create -f qcow2 -F qcow2 -b "../system/$(basename "$BASE")" "$(basename "$OVERLAY")" >/dev/null )
    [ -f "$OVERLAY" ] || die 'qemu-img не смог создать оверлей'
    log OK 'создан оверлей (изменения хранятся отдельно от образа системы)'
}

make_checkpoint() {
    local reason="${1:-manual}"
    if [ ! -f "$OVERLAY" ]; then
        log WARN 'контрольная точка не создана: оверлея ещё нет'
        return 1
    fi
    local name target
    name=$(date +%Y%m%d-%H%M%S)
    target="$CHECKPOINT_DIR/$name"
    if [ "$DRY_RUN" -eq 1 ]; then
        log INFO "DRY-RUN: контрольная точка $name → $target"
        return 0
    fi
    mkdir -p "$target"
    cp -f "$OVERLAY" "$target/overlay.qcow2"
    cat > "$target/meta.json" <<META
{
  "name": "$name",
  "created": "$(date -Iseconds)",
  "reason": "$reason",
  "host": "$(hostname)",
  "size": $(stat -c%s "$target/overlay.qcow2" 2>/dev/null || stat -f%z "$target/overlay.qcow2"),
  "note": "Точка содержит только систему/настройки с SSD; общие файлы data/ не входят"
}
META
    log OK "контрольная точка создана: karman/checkpoints/$name"

    local count
    count=$(find "$CHECKPOINT_DIR" -maxdepth 1 -mindepth 1 -type d | wc -l)
    if [ "$count" -gt "$M_MAXPOINTS" ]; then
        find "$CHECKPOINT_DIR" -maxdepth 1 -mindepth 1 -type d | sort | head -n $((count - M_MAXPOINTS)) | while read -r old; do
            case "$(basename "$old")" in pre-restore-*) continue ;; esac
            rm -rf "$old"
            log INFO "удалена старая точка $(basename "$old") (лимит $M_MAXPOINTS)"
        done
    fi
    return 0
}

restore_checkpoint() {
    local point="$1" source
    if [ -z "$point" ]; then
        point=$(find "$CHECKPOINT_DIR" -maxdepth 1 -mindepth 1 -type d 2>/dev/null | sort | tail -n 1)
        [ -n "$point" ] || die 'контрольных точек нет — восстанавливать нечего'
        point=$(basename "$point")
    fi
    source="$CHECKPOINT_DIR/$point/overlay.qcow2"
    [ -f "$source" ] || die "в точке $point нет overlay.qcow2"

    local backup="pre-restore-$(date +%Y%m%d-%H%M%S)"
    if [ "$DRY_RUN" -eq 1 ]; then
        log INFO "DRY-RUN: сохранил бы текущее в checkpoints/$backup и восстановил из $point"
        return 0
    fi
    if [ -f "$OVERLAY" ]; then
        mkdir -p "$CHECKPOINT_DIR/$backup"
        cp -f "$OVERLAY" "$CHECKPOINT_DIR/$backup/overlay.qcow2"
        log INFO "текущее состояние сохранено в checkpoints/$backup — восстановление обратимо"
    fi
    cp -f "$source" "$OVERLAY"
    log OK "восстановлено из точки $point; общие файлы data/ не изменялись"
    log WARN 'восстановление не гарантирует целостность файлов, не дописанных в момент сбоя'
}

reset_system() {
    if [ ! -f "$OVERLAY" ]; then
        log INFO 'сбрасывать нечего: оверлея нет'
        return 0
    fi
    if [ "$DRY_RUN" -eq 1 ]; then
        log INFO 'DRY-RUN: удалил бы оверлей (система вернётся к base)'
        return 0
    fi
    make_checkpoint 'before-reset' >/dev/null || true
    rm -f "$OVERLAY"
    log OK 'оверлей удалён: система вернётся к заводскому состоянию, data/ не тронуты'
}

start_session() {
    local accel="tcg"
    if [ -r /dev/kvm ] && [ -w /dev/kvm ]; then accel="kvm"; fi

    local args=(
        -name KARMAN
        -machine q35
        -m "$M_MEMORY"
        -smp "$M_CPUS"
        -accel "$accel"
        -drive "file=$OVERLAY,if=virtio,format=qcow2"
    )

    if [ -d "$DATA_DIR" ] && [ "$M_SHARE" != "none" ]; then
        if [ "$WRITABLE_DATA" -eq 1 ] || [ "$M_SHARE" = "rw" ]; then
            log WARN 'общие файлы подключаются с ЗАПИСЬЮ: FAT-мост QEMU экспериментален, возможна порча файлов'
            args+=(-drive "file=fat:rw:$DATA_DIR,format=raw")
        else
            log INFO 'общие файлы подключаются только для чтения (по умолчанию)'
            args+=(-drive "file=fat:$DATA_DIR,format=raw,readonly=on")
        fi
    fi

    args+=(
        -netdev user,id=net0
        -device virtio-net-pci,netdev=net0
        -device virtio-vga
        -device qemu-xhci,id=xhci
        -device usb-tablet,bus=xhci.0
    )

    if [ -n "${DISPLAY:-}${WAYLAND_DISPLAY:-}" ]; then
        args+=(-display gtk)
    else
        args+=(-nographic)
        warning 'нет графической сессии: Linux будет в консоли этого терминала (нужен console=ttyS0 в образе)'
    fi

    log INFO "движок: QEMU ($QEMU_BIN), ускорение $accel, $M_MEMORY МБ RAM, $M_CPUS vCPU"

    if [ "$DRY_RUN" -eq 1 ]; then
        log INFO "DRY-RUN: $QEMU_BIN ${args[*]}"
        return 0
    fi

    cat > "$LOCK" <<LOCK
{
  "started": "$(date -Iseconds)",
  "host": "$(hostname)",
  "user": "$(id -un 2>/dev/null || echo unknown)",
  "launcher": "$LAUNCHER_VERSION",
  "accel": "$accel"
}
LOCK
    log INFO 'сессия начата, блокировка записана в karman/state/session.lock'
    log INFO 'выключай Linux ИЗНУТРИ системы — так файловая система закроется корректно'

    "$QEMU_BIN" "${args[@]}"
    local rc=$?

    if [ "$rc" -eq 0 ]; then
        rm -f "$LOCK"
        log OK 'Linux выключен корректно, блокировка снята'
        return 0
    fi
    log ERROR "Linux завершился с кодом $rc; блокировка оставлена — при следующем запуске будет предупреждение"
    return 1
}

eject_disk() {
    [ "$DRY_RUN" -eq 1 ] && { log INFO "DRY-RUN: безопасно отключил бы $ROOT"; return 0; }
    [ -f "$LOCK" ] && die 'сессия не закрыта: сначала выключи Linux, извлечение отменено'
    local device
    if command -v findmnt >/dev/null 2>&1; then
        device=$(findmnt -no SOURCE --target "$ROOT" 2>/dev/null | head -n1)
    fi
    if [ -z "${device:-}" ]; then
        log WARN 'не удалось определить устройство; отмонтируй вручную: udisksctl unmount -b /dev/sdX1'
        return 0
    fi
    if command -v udisksctl >/dev/null 2>&1; then
        if udisksctl unmount -b "$device"; then
            log OK "накопитель отмонтирован ($device). Можно вынимать."
            return 0
        fi
        log ERROR "не удалось отмонтировать $device — закрой программы, использующие накопитель"
        return 1
    fi
    log WARN "udisksctl не найден; отмонтируй вручную: umount $ROOT"
}

show_menu() {
    banner
    echo '   [1] Запустить Linux    [2] Контрольная точка'
    echo '   [3] Проверить          [4] Безопасно отключить'
    echo '   [5] Восстановить       [6] Сбросить систему'
    echo '   [0] Выход'
    echo
    echo "   ${C_GRAY}Linux работает в виртуальной машине; данные — на этом накопителе.${C_OFF}"
    echo "   ${C_YELLOW}Шифрования нет: содержимое прочитает любой, кто подключит накопитель.${C_OFF}"
    echo
    choice=""
    read -r -p '  Выбор: ' choice || true
    case "$choice" in
        1) ACTION=start ;;
        2) ACTION=checkpoint ;;
        3) ACTION=verify ;;
        4) ACTION=eject ;;
        5) ACTION=restore ;;
        6) ACTION=reset ;;
        *) ACTION=exit ;;
    esac
}

# ---------------------------------------------------------------------------

banner
log INFO "KARMAN launcher $LAUNCHER_VERSION, накопитель $ROOT"

[ -f "$MANIFEST" ] || die 'не найден karman/manifest.json — накопитель не подготовлен (tools/prepare_ssd.py)'
need_python
eval "$(read_manifest)" || die 'manifest.json не читается'

if [ "$ACTION" = "menu" ]; then
    show_menu
    [ "$ACTION" = "exit" ] && { log INFO 'выход без действий'; exit 0; }
fi

case "$ACTION" in
    verify)
        run_preflight
        show_preflight
        echo
        if [ "$ISSUES" -eq 0 ]; then
            log OK 'накопитель готов к запуску'
            echo; log INFO "журнал: $LOG_FILE"
            exit 0
        fi
        echo; log INFO "журнал: $LOG_FILE"
        exit 1
        ;;
    checkpoint)
        run_preflight; show_preflight
        make_checkpoint 'manual'
        ;;
    restore)
        run_preflight; show_preflight
        restore_checkpoint "$RESTORE_NAME"
        ;;
    reset)
        run_preflight; show_preflight
        answer=""
        read -r -p '  Сбросить систему к заводскому состоянию? data/ не пострадают. [д/Н] ' answer || true
        case "$answer" in
            д|y|да|yes|Y) reset_system ;;
            *) log INFO 'сброс отменён' ;;
        esac
        ;;
    eject)
        # извлечение не зависит от целостности образа: проверяем только сессию
        LOCK="$KARMAN_DIR/state/session.lock"
        eject_disk
        ;;
    start)
        run_preflight; show_preflight
        if [ "$ISSUES" -ne 0 ]; then
            die 'запуск отменён: сначала устрани ошибки выше (подробности — в README раздела)'
        fi
        create_overlay
        if start_session; then
            if [ "$DRY_RUN" -eq 0 ]; then
                echo
                answer=""
                read -r -p '  Создать контрольную точку? [д/Н] ' answer || true
                case "$answer" in д|y|да|yes|Y) make_checkpoint 'after-session' ;; esac
                answer2=""
                read -r -p '  Безопасно отключить накопитель? [д/Н] ' answer2 || true
                case "$answer2" in д|y|да|yes|Y) eject_disk ;; esac
            fi
        else
            echo; log INFO "журнал: $LOG_FILE"
            exit 1
        fi
        ;;
esac

echo
log INFO "журнал: $LOG_FILE"
exit 0
