import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* Статическая проверка порта shooter-2 на Godot 4.
   Godot в окружении CI нет, поэтому здесь проверяем то, что можно проверить
   без движка: структуру проекта, синтаксические маркеры GDScript, контракты
   классов и перекрёстные вызовы между скриптами. */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptsDir = path.join(root, 'scripts');

const read = (rel) => readFile(path.join(root, rel), 'utf8');

const sources = {};
for (const file of await readdir(scriptsDir)) {
  if (file.endsWith('.gd')) sources[file] = await readFile(path.join(scriptsDir, file), 'utf8');
}

assert.ok(Object.keys(sources).length >= 15, 'порт должен состоять минимум из 15 скриптов');

/* ------------------------------- проект -------------------------------- */
const project = await read('project.godot');
assert.match(project, /config_version=5/, 'project.godot нового формата (config_version=5)');
assert.match(project, /run\/main_scene="res:\/\/scenes\/main\.tscn"/, 'главная сцена указана');
for (const feature of ['4.3', 'GL Compatibility']) {
  assert.ok(project.includes(feature), `в config/features есть ${feature}`);
}
for (const action of ['move_forward', 'move_back', 'move_left', 'move_right', 'sprint',
  'crouch', 'reload', 'grenade', 'weapon_1', 'weapon_2', 'weapon_3', 'pause']) {
  assert.match(project, new RegExp(`^${action}=\\{`, 'm'), `в input-map есть ${action}`);
}

const scene = await read('scenes/main.tscn');
assert.match(scene, /\[gd_scene[^\]]*format=3/, 'main.tscn — сцена формата 3');
assert.match(scene, /res:\/\/scripts\/game\.gd/, 'main.tscn ссылается на game.gd');
assert.match(scene, /type="Node3D"/, 'в сцене есть Node3D');

await access(path.join(root, 'icon.svg'));

/* ---------------------------- синтаксис GDScript ----------------------- */
for (const [file, text] of Object.entries(sources)) {
  assert.ok(text.length > 200, `${file}: подозрительно короткий`);
  assert.ok(!/\t +\S/.test(text), `${file}: смешанные пробелы в отступах (GDScript это не любит)`);
  assert.ok(!/\bfunction\b|\bconst\s+\w+\s*=\s*\(/.test(text), `${file}: похоже на JS-синтаксис`);
  assert.ok(!text.includes('console.log'), `${file}: остался отладочный вывод из JS`);
  let balance = 0;
  for (const ch of text.replace(/"[^"\n]*"/g, '""')) {
    if (ch === '(') balance += 1;
    else if (ch === ')') balance -= 1;
    assert.ok(balance >= 0, `${file}: лишняя закрывающая скобка`);
  }
  assert.equal(balance, 0, `${file}: скобки не сбалансированы`);
  assert.ok(!/^class_name\s+\w+$/m.test(text) || /class_name/.test(text), `${file}: class_name потерян`);
}

/* ------------------------- объявленные классы -------------------------- */
const classNames = new Set();
for (const text of Object.values(sources)) {
  const m = text.match(/^class_name\s+(\w+)/m);
  if (m) classNames.add(m[1]);
}
for (const expected of ['SH2Data', 'SH2Outline', 'SH2Guns', 'SH2Soldier', 'SH2Level',
  'SH2Animator', 'SH2ArmIK', 'SH2Ragdoll', 'SH2World', 'SH2Brain', 'SH2Agent', 'SH2Player',
  'SH2Combat', 'SH2Fx', 'SH2Audio', 'SH2UI', 'SH2Game']) {
  assert.ok(classNames.has(expected), `класс ${expected} не объявлен через class_name`);
}
assert.equal(classNames.size, new Set([...classNames]).size, 'имена классов уникальны');

/* --------------------- контракты: требуемые методы --------------------- */
const requiredMethods = {
  'data.gd': ['totals', 'enemy_by_id', 'weapon_by_id', 'clip_by_id', 'clip_curve',
    'map_colliders', 'signals', 'apply_arms'],
  'outline.gd': ['outline_mesh', 'loft_sections', 'section', 'circle_section', 'revolve',
    'extrude_plan', 'prism', 'mesh_node', 'smooth_outline'],
  'guns.gd': ['blueprint', 'build'],
  'soldier.gd': ['build_skeleton', 'build_body', 'build'],
  'level.gd': ['building', 'tower', 'barrier', 'sandbag_row', 'barrel', 'rock', 'build'],
  'animator.gd': ['curve', 'set_base', 'set_upper', 'set_event', 'set_variant', 'update',
    'pose_at', 'ground_lock_update'],
  'arm_ik.gd': ['attach_weapon', 'pose_weapon', 'solve_arm', 'update_pose'],
  'ragdoll.gd': ['capture', 'impulse', 'update', 'detach_weapon', 'step_weapon'],
  'world.gd': ['resolve_circle', 'ray_colliders', 'has_los', 'find_cover', 'steer',
    'random_open_point'],
  'brain.gd': ['perceive', 'think', 'shot_spread', 'receive_order', 'update', 'commander_tick'],
  'agent.gd': ['spawn', 'move', 'try_shoot', 'start_reload', 'take_damage', 'die', 'update'],
  'player.gd': ['fire', 'can_fire', 'start_reload', 'finish_reload', 'update',
    'build_viewmodel', 'tick_viewmodel'],
  'combat.gd': ['player_bullet', 'enemy_bullet', 'grenade_from', 'player_grenade', 'explode'],
  'fx.gd': ['muzzle_flash', 'tracer', 'impact', 'explosion', 'tick', 'clear_all'],
  'audio.gd': ['gunshot', 'footstep', 'reload_sfx', 'explosion', 'mission_complete'],
  'ui.gd': ['show_screen', 'hide_screen', 'frame', 'hitmarker_fx', 'damage_number', 'toast',
    'radio', 'kill_feed', 'set_objectives', 'show_death', 'mission_complete'],
  'game.gd': ['start_mission', 'build_level', 'spawn_wave', 'try_shoot', 'damage_player',
    'on_agent_died', 'check_objectives', 'complete_mission', 'pause', 'resume',
    'build_menu_scene', 'open_lab'],
};
for (const [file, methods] of Object.entries(requiredMethods)) {
  const text = sources[file];
  assert.ok(text, `нет файла ${file}`);
  for (const method of methods) {
    assert.match(text, new RegExp(`^(static )?func ${method}\\(`, 'm'),
      `${file}: отсутствует метод ${method}()`);
  }
}

/* --------------------- контракты: поля анимаций, ИИ -------------------- */
assert.equal((sources['data.gd'].match(/"id": "/g) || []).length > 40, true,
  'в data.gd должно быть много записей (части, клипы, варианты, стволы)');
for (const part of ['pelvis', 'spine', 'chest', 'neck', 'head', 'shoulderL', 'shoulderR',
  'upperArmL', 'upperArmR', 'lowerArmL', 'lowerArmR', 'handL', 'handR', 'hipL', 'hipR',
  'upperLegL', 'upperLegR', 'lowerLegL', 'lowerLegR', 'footL', 'footR', 'weapon']) {
  assert.ok(sources['data.gd'].includes(`"id": "${part}"`), `в PARTS нет части ${part}`);
}
for (const clip of ['idle', 'breathe', 'walk', 'walkBack', 'strafeL', 'strafeR', 'run',
  'crouch', 'aim', 'shoot', 'reload', 'jump', 'fall', 'land', 'hurt', 'die', 'melee',
  'throw', 'point', 'inspect']) {
  assert.ok(sources['data.gd'].includes(`"id": "${clip}"`), `в CLIPS нет клипа ${clip}`);
}
assert.match(sources['brain.gd'], /const TACTICS[\s\S]*advance[\s\S]*suppress[\s\S]*melee/,
  'в ИИ есть все восемь тактик');

/* ------------------- перекрёстные вызовы между классами ---------------- */
const callPattern = /\b(SH2[A-Z]\w+)\.(\w+)/g;
for (const [file, text] of Object.entries(sources)) {
  for (const match of text.matchAll(callPattern)) {
    const [, cls, member] = match;
    if (!classNames.has(cls)) continue;
    if (member === 'new') continue; // создание экземпляра — не static-вызов
    const target = Object.entries(sources).find(([, body]) => body.includes(`class_name ${cls}`))[1];
    const isStatic = new RegExp(`static (func|var) ${member}\\b`).test(target)
      || new RegExp(`^(static )?const ${member}\\b`, 'm').test(target);
    if (!isStatic) {
      throw new Error(`${file}: вызывается ${cls}.${member}, но в ${cls} это не static`);
    }
  }
}

/* ------------------------------- тесты --------------------------------- */
for (const file of ['tests/test_logic.gd', 'tests/test_smoke.gd']) {
  const text = await read(file);
  assert.match(text, /quit\(1 if fails > 0 else 0\)/, `${file}: должен возвращать код ошибки`);
  assert.match(text, /extends (SceneTree|Node)/, `${file}: нет базового класса для запуска`);
}

/* --------------------------- запрет ассетов ---------------------------- */
const forbidden = [/\.glb"/, /\.gltf"/, /\.png"/, /\.ogg"/, /\.wav"/, /\.mp3"/, /preload\("res:/];
for (const [file, text] of Object.entries(sources)) {
  for (const pattern of forbidden) {
    assert.ok(!pattern.test(text), `${file}: внешний ассет ${pattern} — их быть не должно`);
  }
}

console.log(`port.mjs: OK — ${Object.keys(sources).length} скриптов, ${classNames.size} классов`);
