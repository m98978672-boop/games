#!/usr/bin/env python3
"""
SourceBot (E1001–E1005) — автоматический аудит реальных данных /data/real/*.json,
ссылок в docs/SOURCES.md, лицензий и атрибуции в docs/CREDITS.md, и привязок в data/items.json.
"""

import glob
import json
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
REAL_DIR = os.path.join(ROOT, "data", "real")
ITEMS_PATH = os.path.join(ROOT, "data", "items.json")
SOURCES_PATH = os.path.join(ROOT, "docs", "SOURCES.md")
CREDITS_PATH = os.path.join(ROOT, "docs", "CREDITS.md")
REPORT_PATH = os.path.join(ROOT, "source_report.json")

FORBIDDEN_HOSTS = ("example.com", "localhost", "127.0.0.1", "placeholder")
REQUIRED_FIELDS = ("id", "item", "metric", "real_value", "unit", "game_value", "scale_factor", "source", "license", "confidence", "note")


def main():
    with open(SOURCES_PATH, "r", encoding="utf-8") as f:
        sources_md = f.read()
    with open(CREDITS_PATH, "r", encoding="utf-8") as f:
        credits_md = f.read()
    with open(ITEMS_PATH, "r", encoding="utf-8") as f:
        items_data = json.load(f)

    errors = []
    real_ids = set()
    record_count = 0

    for fp in sorted(glob.glob(os.path.join(REAL_DIR, "*.json"))):
        fname = os.path.basename(fp)
        with open(fp, "r", encoding="utf-8") as f:
            doc = json.load(f)
        for rec in doc.get("records", []):
            record_count += 1
            rid = rec.get("id", "<no_id>")
            real_ids.add(rid)
            for req in REQUIRED_FIELDS:
                if req not in rec:
                    errors.append({"code": "E1005", "file": fname, "id": rid, "msg": f"Отсутствует обязательное поле '{req}'"})

            url = str(rec.get("source", ""))
            if not url.startswith("https://") or any(bad in url for bad in FORBIDDEN_HOSTS):
                errors.append({"code": "E1001", "file": fname, "id": rid, "msg": f"Недопустимый URL источника: {url}"})
            elif url not in sources_md:
                errors.append({"code": "E1001", "file": fname, "id": rid, "msg": f"URL отсутствует в SOURCES.md: {url}"})

            lic = str(rec.get("license", ""))
            if not lic:
                errors.append({"code": "E1002", "file": fname, "id": rid, "msg": "Не указана лицензия источника"})
            elif "Wikipedia" in lic and "CC BY-SA" not in credits_md:
                errors.append({"code": "E1002", "file": fname, "id": rid, "msg": "В CREDITS.md отсутствует атрибуция CC BY-SA 4.0"})

            conf = str(rec.get("confidence", ""))
            rval = rec.get("real_value")
            note = str(rec.get("note", ""))
            if conf == "LOW" or rval == "ДАННЫЕ НЕ НАЙДЕНЫ":
                if "[ОЦЕНКА]" not in note:
                    errors.append({"code": "E1004", "file": fname, "id": rid, "msg": "Запись LOW / без точных данных обязана иметь тег [ОЦЕНКА] в note"})

    # E1003: проверка даты доступа в SOURCES.md
    if "2026-11-10" not in sources_md:
        errors.append({"code": "E1003", "file": "SOURCES.md", "id": "date", "msg": "В SOURCES.md отсутствует дата доступа 2026-11-10"})

    # E1005: проверка ссылок real_ref из items.json
    for item in items_data.get("items", []):
        ref = item.get("real_ref", "")
        if ref not in real_ids:
            errors.append({"code": "E1005", "file": "items.json", "id": item["id"], "msg": f"real_ref '{ref}' не найден в /data/real/*.json"})

    # Проверка синтаксиса всех URL в SOURCES.md
    urls_in_sources = re.findall(r"https?://[^\s|]+", sources_md)
    for u in urls_in_sources:
        if any(bad in u for bad in FORBIDDEN_HOSTS):
            errors.append({"code": "E1001", "file": "SOURCES.md", "id": "url", "msg": f"Фиктивный URL: {u}"})

    report = {
        "bot": "SourceBot",
        "status": "PASS" if not errors else "FAIL",
        "real_records": record_count,
        "items_checked": len(items_data.get("items", [])),
        "sources_urls": len(urls_in_sources),
        "errors_count": len(errors),
        "errors": errors,
    }
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"[SourceBot] Записей /data/real={record_count}, Предметов={len(items_data.get('items', []))}, URL в SOURCES={len(urls_in_sources)}, Ошибок={len(errors)}, Статус={report['status']}")
    for err in errors[:15]:
        print(f"  [{err['code']}] {err['file']}::{err['id']}: {err['msg']}")
    sys.exit(0 if not errors else 1)


if __name__ == "__main__":
    main()
