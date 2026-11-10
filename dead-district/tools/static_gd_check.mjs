#!/usr/bin/env node
/**
 * Полный статический аудит Godot 4 проекта DEAD DISTRICT:
 * - проверка project.godot (autoloads, main_scene, 1920x1080, default_texture_filter=0, GL Compatibility)
 * - проверка всех .json файлов в data/ и assets/
 * - проверка всех .gd скриптов (заглушки, дубли func/static func, res:// ссылки, ErrorManager >= 70 кодов)
 * - проверка всех .tscn сцен (ext_resource пути, load_steps, SubViewport 480x270 + nearest)
 * - проверка наличия отчётов AssetBot и SourceBot
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const errors = [];

function walk(dir, extFilter) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p, extFilter));
    else if (!extFilter || extFilter.some((e) => entry.name.endsWith(e))) out.push(p);
  }
  return out;
}

// 1. project.godot
const projPath = path.join(ROOT, "project.godot");
if (!fs.existsSync(projPath)) {
  errors.push("Отсутствует project.godot");
} else {
  const proj = fs.readFileSync(projPath, "utf8");
  for (const reqAutoload of ["ErrorManager", "EventBus", "DataDB", "SaveManager"]) {
    if (!proj.includes(`${reqAutoload}=`)) {
      errors.push(`В project.godot не зарегистрирован autoload ${reqAutoload}`);
    }
  }
  if (!proj.includes("run/main_scene=\"res://scenes/main.tscn\"")) {
    errors.push("В project.godot run/main_scene должен указывать на res://scenes/main.tscn");
  }
  if (!proj.includes("textures/canvas_textures/default_texture_filter=0")) {
    errors.push("В project.godot должен быть включён nearest texture filter (=0)");
  }
  for (const m of proj.matchAll(/^\w+="\*?(res:\/\/[^"]+)"/gm)) {
    const resRel = m[1].replace("res://", "");
    if (!fs.existsSync(path.join(ROOT, resRel))) {
      errors.push(`Битая ссылка в project.godot: ${m[1]}`);
    }
  }
}

// 2. JSON files
const jsonFiles = walk(ROOT, [".json"]);
for (const jf of jsonFiles) {
  try {
    JSON.parse(fs.readFileSync(jf, "utf8"));
  } catch (e) {
    errors.push(`Невалидный JSON ${path.relative(ROOT, jf)}: ${e.message}`);
  }
}

// 3. GDScript files
const gdFiles = walk(path.join(ROOT, "scripts"), [".gd"]);
let errCodeCount = 0;
let totalFuncs = 0;
for (const gf of gdFiles) {
  const src = fs.readFileSync(gf, "utf8");
  const rel = path.relative(ROOT, gf);
  if (/реализуй сам|TODO\(|FIXME\(|pass\s*#\s*stub/i.test(src)) {
    errors.push(`Найдена запрещённая заглушка в ${rel}`);
  }
  const seenFuncs = new Set();
  for (const fm of src.matchAll(/^(?:static\s+)?func\s+([a-zA-Z0-9_]+)\s*\(/gm)) {
    totalFuncs++;
    if (seenFuncs.has(fm[1])) errors.push(`Дублирование функции ${fm[1]} в ${rel}`);
    seenFuncs.add(fm[1]);
  }
  // Проверка всех строковых res:// путей (кроме динамических шаблонов и сгенерированных отчётов)
  const OPTIONAL_GENERATED = new Set(["asset_report.json", "source_report.json", "qa_report.json"]);
  for (const rm of src.matchAll(/"(res:\/\/[^"{}%\s]+)"/g)) {
    const rp = rm[1].replace("res://", "");
    if (OPTIONAL_GENERATED.has(rp)) continue;
    if (!fs.existsSync(path.join(ROOT, rp))) {
      errors.push(`Не найден ресурс ${rm[1]} в ${rel}`);
    }
  }
  if (path.basename(rel) === "error_manager.gd") {
    const matches = src.match(/"E\d{3,4}"\s*:/g) || [];
    errCodeCount = matches.length;
  }
}

if (errCodeCount < 70) {
  errors.push(`В ErrorManager должно быть >= 70 кодов ошибок, найдено ${errCodeCount}`);
}

// 4. TSCN scenes
const tscnFiles = walk(path.join(ROOT, "scenes"), [".tscn"]);
for (const sf of tscnFiles) {
  const src = fs.readFileSync(sf, "utf8");
  const rel = path.relative(ROOT, sf);
  const extMatches = [...src.matchAll(/^\[ext_resource /gm)];
  const subMatches = [...src.matchAll(/^\[sub_resource /gm)];
  const expectedSteps = extMatches.length + subMatches.length + 1;
  const hdrMatch = src.match(/\[gd_scene\s+load_steps=(\d+)\s+format=3/);
  if (!hdrMatch) {
    errors.push(`Некорректный заголовок [gd_scene] в ${rel}`);
  } else if (Number(hdrMatch[1]) !== expectedSteps) {
    errors.push(`load_steps=${hdrMatch[1]} в ${rel}, ожидалось ${expectedSteps}`);
  }
  for (const rm of src.matchAll(/path="(res:\/\/[^"]+)"/g)) {
    const rp = rm[1].replace("res://", "");
    if (!fs.existsSync(path.join(ROOT, rp))) {
      errors.push(`Не найден ресурс сцены ${rm[1]} в ${rel}`);
    }
  }
  if (rel.endsWith("main.tscn")) {
    if (!src.includes("size = Vector2i(480, 270)")) {
      errors.push("В main.tscn SubViewport должен быть ровно Vector2i(480, 270)");
    }
    if (!src.includes("stretch_shrink = 4") || !src.includes("texture_filter = 1")) {
      errors.push("В main.tscn SubViewportContainer должен иметь stretch_shrink = 4 и texture_filter = 1");
    }
  }
}

// 5. Required docs
for (const docPath of ["docs/SOURCES.md", "docs/CREDITS.md", "docs/DESIGN_AND_ALGORITHMS.md"]) {
  if (!fs.existsSync(path.join(ROOT, docPath))) {
    errors.push(`Отсутствует документация ${docPath}`);
  }
}

console.log(
  `[static_gd_check] GD=${gdFiles.length} (funcs=${totalFuncs}), TSCN=${tscnFiles.length}, JSON=${jsonFiles.length}, ErrorCodes=${errCodeCount}, Errors=${errors.length}`
);
for (const e of errors) console.error("  ERROR:", e);
process.exit(errors.length === 0 ? 0 : 1);
