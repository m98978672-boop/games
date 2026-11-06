#!/usr/bin/env bash
# =============================================================================
#  KARMAN · Android — карманная Linux-среда на телефоне (Termux)
#
#  Это НЕ полноценная виртуальная машина: без root ядро у Android одно,
#  поэтому Linux работает в userspace через proot-distro. Отсюда ограничения:
#    * исполнять файлы прямо с USB-SSD нельзя (SAF/FUSE запрещает exec),
#      поэтому окружение живёт во внутренней памяти Termux, а SSD хранит
#      данные, архив rootfs и точки;
#    * mount/systemd/docker недоступны, часть пакетов не работает;
#    * SSD виден через SAF (~/storage/external-1/...) — это медленнее и без POSIX-прав.
#
#  Что нужно на телефоне (программы, а не данные):
#     Termux, proot-distro, разрешение на накопитель: termux-setup-storage
#  Что нужно на SSD (данные):
#     раскладка из tools/prepare_ssd.py: karman/manifest.json, data/, rootfs.tar
#
#  Использование:
#     bash karman-android.sh check          только проверки
#     bash karman-android.sh start          синхронизировать данные и войти в Linux
#     bash karman-android.sh sync-in        SSD → рабочая папка
#     bash karman-android.sh sync-out       рабочая папка → SSD
#     bash karman-android.sh checkpoint     архив данных на SSD
#     флаги: --dry-run, --distro <имя proot-distro>, --ssd <путь>
# =============================================================================

set -u

ACTION="check"
DRY_RUN=0
DISTRO_OVERRIDE=""
SSD_OVERRIDE=""

while [ $# -gt 0 ]; do
    case "$1" in
        check|start|sync-in|sync-out|checkpoint) ACTION="$1" ;;
        --dry-run) DRY_RUN=1 ;;
        --distro) shift; DISTRO_OVERRIDE="${1:-}" ;;
        --ssd) shift; SSD_OVERRIDE="${1:-}" ;;
        -h|--help) sed -n '2,30p' "$0"; exit 0 ;;
        *) echo "неизвестный аргумент: $1" >&2; exit 2 ;;
    esac
    shift
done

WORK="${KARMAN_WORK:-$HOME/karman}"
SSD="${SSD_OVERRIDE:-${KARMAN_SSD:-}}"
DRY_RUN="${KARMAN_DRY_RUN:-$DRY_RUN}"

C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'; C_RED=$'\033[31m'; C_GRAY=$'\033[90m'; C_OFF=$'\033[0m'
if [ ! -t 1 ]; then C_GREEN=""; C_YELLOW=""; C_RED=""; C_GRAY=""; C_OFF=""; fi

ISSUES=0
WARNINGS=0

log() {
    local level="$1"; shift
    local color="$C_GRAY"
    case "$level" in
        OK) color="$C_GREEN" ;;
        WARN) color="$C_YELLOW" ;;
        ERROR) color="$C_RED" ;;
    esac
    printf '  [%s%-5s%s] %s\n' "$color" "$level" "$C_OFF" "$*"
}
problem() { ISSUES=$((ISSUES + 1)); log ERROR "$*"; }
warning() { WARNINGS=$((WARNINGS + 1)); log WARN "$*"; }

find_ssd() {
    if [ -n "$SSD" ]; then
        printf '%s\n' "$SSD"
        return 0
    fi
    local candidate
    for candidate in \
        "$HOME/storage/external-1" \
        "$HOME/storage/external-2" \
        "$HOME/storage/usb" \
        /mnt/media_rw/* \
        /storage/* ; do
        [ -d "$candidate" ] || continue
        if [ -f "$candidate/karman/manifest.json" ]; then
            printf '%s\n' "$candidate"
            return 0
        fi
        local nested
        for nested in "$candidate"/*/ ; do
            [ -f "${nested}karman/manifest.json" ] || continue
            printf '%s\n' "${nested%/}"
            return 0
        done
    done
    return 1
}

manifest_get() {
    python3 - "$1" "$2" <<'PY'
import json, sys
path, key = sys.argv[1], sys.argv[2]
try:
    data = json.load(open(path, encoding='utf-8'))
except Exception:
    print('')
    raise SystemExit(0)
current = data
for part in key.split('.'):
    if not isinstance(current, dict) or part not in current:
        print('')
        raise SystemExit(0)
    current = current[part]
print(current if current is not None else '')
PY
}

sha256_of() {
    if command -v sha256sum >/dev/null 2>&1; then
        sha256sum "$1" | awk '{print $1}'
    else
        shasum -a 256 "$1" | awk '{print $1}'
    fi
}

gb_of_bytes() { awk -v b="$1" 'BEGIN {printf "%.2f", b/1073741824}'; }

free_kb() {
    df -Pk "${1:-$HOME}" 2>/dev/null | awk 'NR==2 {print $4}'
}

# ---------------------------------------------------------------------------

log INFO "KARMAN · Android (Termux). Рабочая папка: $WORK"
log INFO "Это userspace-окружение (proot), а не виртуальная машина: своё ядро Linux на Android без root невозможно."
log WARN 'шифрования нет: любой, кто подключит накопитель, прочитает data/ и архив системы'

if [ -z "${PREFIX:-}" ] && [ -z "${TERMUX_VERSION:-}" ] && [ -z "${KARMAN_ALLOW_ANY:-}" ]; then
    warning 'похоже, это не Termux (нет $PREFIX/TERMUX_VERSION). Скрипт рассчитан на Termux; тестовый режим: KARMAN_ALLOW_ANY=1'
fi

SSD_FOUND="$(find_ssd || true)"
if [ -z "$SSD_FOUND" ]; then
    problem 'не найден подготовленный накопитель (ищу karman/manifest.json). Выдай доступ: termux-setup-storage, или укажи --ssd /path'
    printf '  проверки не пройдены (%s ошибок, %s предупреждений)\n' "$ISSUES" "$WARNINGS"
    exit 1
fi
log OK "накопитель: $SSD_FOUND"
MANIFEST="$SSD_FOUND/karman/manifest.json"

DISTRO="${DISTRO_OVERRIDE:-$(manifest_get "$MANIFEST" 'android.distro')}"
[ -n "$DISTRO" ] || DISTRO="$(manifest_get "$MANIFEST" 'engine.wsl.distro')"
[ -n "$DISTRO" ] || DISTRO="debian"

ROOTFS_REL="$(manifest_get "$MANIFEST" 'system.rootfs')"
[ -n "$ROOTFS_REL" ] || ROOTFS_REL="karman/system/rootfs.tar"
ROOTFS="$SSD_FOUND/$ROOTFS_REL"
EXPECTED_SHA="$(manifest_get "$MANIFEST" 'system.rootfs_sha256')"
DATA_DIR="$SSD_FOUND/$(manifest_get "$MANIFEST" 'data.dir')"
[ -d "$DATA_DIR" ] || DATA_DIR="$SSD_FOUND/data"
WORK_DATA="$WORK/data"

if [ "$(manifest_get "$MANIFEST" 'layout')" != "1" ]; then
    problem 'версия раскладки не поддерживается (ожидается 1)'
fi

if ! command -v python3 >/dev/null 2>&1; then
    problem 'нет python3 (в Termux: pkg install python) — без него не прочитать manifest.json'
fi

command -v proot-distro >/dev/null 2>&1 || \
    warning 'proot-distro не установлен (в Termux: pkg install proot-distro) — вход в Linux не сработает'

if [ ! -f "$ROOTFS" ]; then
    warning "нет архива системы $ROOTFS_REL — первый вход в Linux будет невозможен (нужен rootfs.tar)"
elif [ -n "$EXPECTED_SHA" ]; then
    ACTUAL_SHA="$(sha256_of "$ROOTFS")"
    if [ "$ACTUAL_SHA" != "$EXPECTED_SHA" ]; then
        problem "sha256 rootfs.tar не совпадает с манифестом (получен ${ACTUAL_SHA:0:12}…) — архив изменён"
    else
        log OK "целостность rootfs.tar подтверждена"
    fi
else
    warning 'в манифесте нет sha256 rootfs.tar — целостность не проверяется'
fi

[ -d "$DATA_DIR" ] || warning "нет каталога данных $DATA_DIR"
[ -d "$WORK" ] || log INFO "рабочая папка будет создана: $WORK"
FREE_KB="$(free_kb "$HOME")"
FREE_KB="${FREE_KB:-0}"
ROOTFS_SIZE=0
[ -f "$ROOTFS" ] && ROOTFS_SIZE=$(stat -c%s "$ROOTFS" 2>/dev/null || echo 0)
NEED_KB=$((ROOTFS_SIZE / 1024 * 2 + 512 * 1024))
if [ "$FREE_KB" -lt "$NEED_KB" ]; then
    problem "во внутренней памяти мало места: свободно $(gb_of_bytes $((FREE_KB * 1024))) ГБ, нужно примерно $(gb_of_bytes $((NEED_KB * 1024))) ГБ"
fi

if command -v termux-setup-storage >/dev/null 2>&1 && [ ! -d "$HOME/storage" ]; then
    warning 'разрешение на файлы не выдано: запусти termux-setup-storage'
fi

echo
if [ "$ISSUES" -eq 0 ]; then
    log OK "проверки пройдены (предупреждений: $WARNINGS)"
else
    log ERROR "проверки не пройдены: ошибок $ISSUES, предупреждений $WARNINGS"
    [ "$ACTION" = "check" ] && exit 1
fi

sync_in() {
    mkdir -p "$WORK_DATA"
    if command -v rsync >/dev/null 2>&1; then
        if [ "$DRY_RUN" = "1" ]; then
            log INFO "DRY-RUN: rsync -a \"$DATA_DIR/\" \"$WORK_DATA/\""
            return 0
        fi
        rsync -a "$DATA_DIR/" "$WORK_DATA/" && log OK 'данные скопированы с накопителя в память телефона'
    else
        if [ "$DRY_RUN" = "1" ]; then
            log INFO "DRY-RUN: tar-копирование \"$DATA_DIR\" → \"$WORK_DATA\""
            return 0
        fi
        ( cd "$DATA_DIR" && tar cf - . ) | ( cd "$WORK_DATA" && tar xf - ) \
            && log OK 'данные скопированы с накопителя (tar, rsync не найден)'
    fi
}

sync_out() {
    [ -d "$WORK_DATA" ] || { log WARN 'нечего выгружать: рабочей папки данных нет'; return 1; }
    if [ "$DRY_RUN" = "1" ]; then
        log INFO "DRY-RUN: обратная синхронизация \"$WORK_DATA\" → \"$DATA_DIR\""
        return 0
    fi
    if command -v rsync >/dev/null 2>&1; then
        rsync -a "$WORK_DATA/" "$DATA_DIR/" && log OK 'изменения выгружены на накопитель'
    else
        ( cd "$WORK_DATA" && tar cf - . ) | ( cd "$DATA_DIR" && tar xf - ) \
            && log OK 'изменения выгружены на накопитель (tar)'
    fi
}

make_point() {
    local stamp target
    stamp="$(date +%Y%m%d-%H%M%S)"
    target="$SSD_FOUND/karman/checkpoints/android-data-$stamp"
    if [ "$DRY_RUN" = "1" ]; then
        log INFO "DRY-RUN: архив данных в $target/data.tar"
        return 0
    fi
    mkdir -p "$target"
    if tar cf "$target/data.tar" -C "$WORK_DATA" . 2>/dev/null; then
        {
            printf '{\n'
            printf '  "name": "%s",\n' "$stamp"
            printf '  "engine": "android-proot",\n'
            printf '  "scope": "data-only",\n'
            printf '  "created": "%s",\n' "$(date -Iseconds 2>/dev/null || date)"
            printf '  "note": "Точка содержит только файлы data/. Система proot здесь не архивируется: это дорого на телефоне."\n'
            printf '}\n'
        } > "$target/meta.json"
        log OK "контрольная точка данных: karman/checkpoints/android-data-$stamp"
    else
        log ERROR 'не удалось создать архив данных'
        return 1
    fi
}

case "$ACTION" in
    check) : ;;
    sync-in) sync_in ;;
    sync-out) sync_out ;;
    checkpoint) make_point ;;
    start)
        sync_in
        mkdir -p "$WORK_DATA"
        if [ "$DRY_RUN" = "1" ]; then
            log INFO "DRY-RUN: proot-distro login $DISTRO --bind $WORK_DATA:/root/data"
            log INFO "DRY-RUN: затем обратная синхронизация и (по желанию) контрольная точка"
            exit 0
        fi
        if ! command -v proot-distro >/dev/null 2>&1; then
            log ERROR 'proot-distro не установлен: pkg install proot-distro (это программа на телефоне, а не данные)'
            exit 1
        fi
        log INFO "вход в Linux ($DISTRO). Файлы с накопителя — в /root/data внутри системы."
        log INFO 'выход — командой exit; после выхода данные вернутся на накопитель'
        proot-distro login "$DISTRO" --bind "$WORK_DATA:/root/data"
        rc=$?
        sync_out
        log INFO 'перед отключением накопителя в приложении: «Безопасно извлечь»/«Отключить USB»'
        exit "$rc"
        ;;
esac

echo
if [ "$ISSUES" -eq 0 ]; then
    log OK 'готово'
    exit 0
fi
exit 1
