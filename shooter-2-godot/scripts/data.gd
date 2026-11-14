extends RefCounted
class_name SH2Data
## СЕКТОР «ПЕПЕЛ» — данные игры (порт с JS на GDScript).
##
## Библиотека анимаций: 22 части тела × 20 анимаций × 4 варианта = 1760 клипов.
## Анимации описаны смысловыми каналами (наклон корпуса, взмах ноги, подъём
## руки, отдача), которые раскладываются по костям с весами. Вариант меняет
## амплитуду, темп, асимметрию, наклон и добавляет детерминированный джиттер.

const TAU := 6.283185307179586

# ---------------------------------------------------------------------------
# 1. ЧАСТИ ТЕЛА
# ---------------------------------------------------------------------------
const PARTS: Array[Dictionary] = [
	{"id": "pelvis", "bone": "pelvis", "role": "root", "group": "core", "label": "Таз (корень)",
		"gain": {"rx": 0.30, "ry": 0.55, "rz": 0.22, "ty": 0.055, "tz": 0.045}},
	{"id": "spine", "bone": "spine", "role": "spineMid", "group": "core", "label": "Поясница",
		"gain": {"rx": 0.32, "ry": 0.30, "rz": 0.20}},
	{"id": "chest", "bone": "chest", "role": "chest", "group": "core", "label": "Грудная клетка",
		"gain": {"rx": 0.36, "ry": 0.42, "rz": 0.26}},
	{"id": "neck", "bone": "neck", "role": "neck", "group": "core", "label": "Шея",
		"gain": {"rx": 0.30, "ry": 0.34, "rz": 0.18}},
	{"id": "head", "bone": "head", "role": "head", "group": "core", "label": "Голова",
		"gain": {"rx": 0.42, "ry": 0.75, "rz": 0.22}},
	{"id": "shoulderL", "bone": "shoulderL", "role": "clavicle", "group": "arms", "side": 1, "label": "Левая ключица",
		"gain": {"rx": 0.22, "ry": 0.16, "rz": 0.34}},
	{"id": "shoulderR", "bone": "shoulderR", "role": "clavicle", "group": "arms", "side": -1, "label": "Правая ключица",
		"gain": {"rx": 0.22, "ry": 0.16, "rz": 0.34}},
	{"id": "upperArmL", "bone": "upperArmL", "role": "upperArm", "group": "arms", "side": 1, "label": "Левое плечо",
		"gain": {"rx": 0.95, "ry": 0.30, "rz": 0.55}},
	{"id": "upperArmR", "bone": "upperArmR", "role": "upperArm", "group": "arms", "side": -1, "label": "Правое плечо",
		"gain": {"rx": 0.95, "ry": 0.30, "rz": 0.55}},
	{"id": "lowerArmL", "bone": "lowerArmL", "role": "lowerArm", "group": "arms", "side": 1, "label": "Левое предплечье",
		"gain": {"rx": 1.05, "ry": 0.14, "rz": 0.12}},
	{"id": "lowerArmR", "bone": "lowerArmR", "role": "lowerArm", "group": "arms", "side": -1, "label": "Правое предплечье",
		"gain": {"rx": 1.05, "ry": 0.14, "rz": 0.12}},
	{"id": "handL", "bone": "handL", "role": "hand", "group": "arms", "side": 1, "label": "Левая кисть",
		"gain": {"rx": 0.40, "ry": 0.34, "rz": 0.40}},
	{"id": "handR", "bone": "handR", "role": "hand", "group": "arms", "side": -1, "label": "Правая кисть",
		"gain": {"rx": 0.40, "ry": 0.34, "rz": 0.40}},
	{"id": "hipL", "bone": "hipL", "role": "hipJoint", "group": "legs", "side": 1, "label": "Левый тазобедренный",
		"gain": {"rx": 0.24, "ry": 0.18, "rz": 0.16}},
	{"id": "hipR", "bone": "hipR", "role": "hipJoint", "group": "legs", "side": -1, "label": "Правый тазобедренный",
		"gain": {"rx": 0.24, "ry": 0.18, "rz": 0.16}},
	{"id": "upperLegL", "bone": "upperLegL", "role": "upperLeg", "group": "legs", "side": 1, "label": "Левое бедро",
		"gain": {"rx": 1.00, "ry": 0.16, "rz": 0.22}},
	{"id": "upperLegR", "bone": "upperLegR", "role": "upperLeg", "group": "legs", "side": -1, "label": "Правое бедро",
		"gain": {"rx": 1.00, "ry": 0.16, "rz": 0.22}},
	{"id": "lowerLegL", "bone": "lowerLegL", "role": "lowerLeg", "group": "legs", "side": 1, "label": "Левое колено",
		"gain": {"rx": 1.20, "ry": 0.10, "rz": 0.10}},
	{"id": "lowerLegR", "bone": "lowerLegR", "role": "lowerLeg", "group": "legs", "side": -1, "label": "Правое колено",
		"gain": {"rx": 1.20, "ry": 0.10, "rz": 0.10}},
	{"id": "footL", "bone": "footL", "role": "foot", "group": "legs", "side": 1, "label": "Левая стопа",
		"gain": {"rx": 0.65, "ry": 0.22, "rz": 0.20}},
	{"id": "footR", "bone": "footR", "role": "foot", "group": "legs", "side": -1, "label": "Правая стопа",
		"gain": {"rx": 0.65, "ry": 0.22, "rz": 0.20}},
	{"id": "weapon", "bone": "weapon", "role": "weapon", "group": "weapon", "label": "Оружие",
		"gain": {"rx": 0.26, "ry": 0.14, "rz": 0.30}},
]

# ---------------------------------------------------------------------------
# 2. НАБОР АНИМАЦИЙ: 20 штук на каждую часть тела (требовалось минимум 15)
# ---------------------------------------------------------------------------
const CLIPS: Array[Dictionary] = [
	{"id": "idle", "label": "Стойка", "dur": 2.60, "loop": true, "tag": "база"},
	{"id": "breathe", "label": "Дыхание", "dur": 3.20, "loop": true, "tag": "база"},
	{"id": "walk", "label": "Шаг вперёд", "dur": 1.00, "loop": true, "tag": "движение"},
	{"id": "walkBack", "label": "Шаг назад", "dur": 1.12, "loop": true, "tag": "движение"},
	{"id": "strafeL", "label": "Шаг влево", "dur": 1.04, "loop": true, "tag": "движение"},
	{"id": "strafeR", "label": "Шаг вправо", "dur": 1.04, "loop": true, "tag": "движение"},
	{"id": "run", "label": "Бег", "dur": 0.68, "loop": true, "tag": "движение"},
	{"id": "crouch", "label": "Присед", "dur": 1.40, "loop": true, "tag": "движение"},
	{"id": "aim", "label": "Прицеливание", "dur": 1.80, "loop": true, "tag": "бой"},
	{"id": "shoot", "label": "Выстрел", "dur": 0.30, "loop": false, "tag": "бой"},
	{"id": "reload", "label": "Перезарядка", "dur": 1.90, "loop": false, "tag": "бой"},
	{"id": "jump", "label": "Прыжок", "dur": 0.50, "loop": false, "tag": "движение"},
	{"id": "fall", "label": "Падение", "dur": 0.90, "loop": true, "tag": "движение"},
	{"id": "land", "label": "Приземление", "dur": 0.45, "loop": false, "tag": "движение"},
	{"id": "hurt", "label": "Ранение", "dur": 0.52, "loop": false, "tag": "реакция"},
	{"id": "die", "label": "Смерть", "dur": 1.10, "loop": false, "tag": "реакция"},
	{"id": "melee", "label": "Ближний бой", "dur": 0.62, "loop": false, "tag": "бой"},
	{"id": "throw", "label": "Бросок гранаты", "dur": 0.80, "loop": false, "tag": "бой"},
	{"id": "point", "label": "Жест / команда", "dur": 1.00, "loop": false, "tag": "реакция"},
	{"id": "inspect", "label": "Осмотр оружия", "dur": 2.20, "loop": false, "tag": "база"},
]

# ---------------------------------------------------------------------------
# 3. ЧЕТЫРЕ ВАРИАНТА КАЖДОЙ АНИМАЦИИ
# ---------------------------------------------------------------------------
const VARIANTS: Array[Dictionary] = [
	{"id": "std", "label": "Стандарт", "amp": 1.00, "speed": 1.00, "asym": 0.00, "lean": 0.00, "jitter": 0.020, "limp": 0.00, "hold": 1.00, "color": "#8fd3ff"},
	{"id": "agg", "label": "Агрессивный", "amp": 1.34, "speed": 1.30, "asym": 0.14, "lean": 0.13, "jitter": 0.075, "limp": 0.00, "hold": 1.12, "color": "#ff8a5c"},
	{"id": "care", "label": "Осмотрительный", "amp": 0.70, "speed": 0.82, "asym": -0.06, "lean": -0.07, "jitter": 0.012, "limp": 0.00, "hold": 0.90, "color": "#9de59b"},
	{"id": "wnd", "label": "Раненый", "amp": 0.84, "speed": 0.88, "asym": 0.34, "lean": 0.24, "jitter": 0.14, "limp": 0.65, "hold": 0.84, "color": "#ff6b6b"},
]

const CHANNELS := ["rx", "ry", "rz", "ty", "tz"]

# позы рук: [плечо (сгиб), локоть (сгиб), подъём ключицы] + качание
const ARM_POSE := {
	"idle": {"r": [0.62, 0.50, 0.10], "l": [0.92, 0.78, 0.04], "sway": 0.03},
	"breathe": {"r": [0.64, 0.52, 0.10], "l": [0.94, 0.80, 0.04], "sway": 0.02},
	"walk": {"r": [0.58, 0.62, 0.08], "l": [0.88, 0.86, 0.04], "sway": 0.12},
	"walkBack": {"r": [0.52, 0.68, 0.10], "l": [0.84, 0.90, 0.04], "sway": 0.08},
	"strafeL": {"r": [0.56, 0.64, 0.16], "l": [0.92, 0.84, 0.10], "sway": 0.05},
	"strafeR": {"r": [0.56, 0.64, 0.16], "l": [0.92, 0.84, 0.10], "sway": 0.05},
	"run": {"r": [0.72, 0.78, 0.06], "l": [1.02, 0.96, 0.02], "sway": 0.26},
	"crouch": {"r": [0.78, 0.70, 0.14], "l": [1.04, 0.92, 0.08], "sway": 0.04},
	"aim": {"r": [0.92, 0.52, 0.20], "l": [1.16, 0.72, 0.14], "sway": 0.015},
	"shoot": {"r": [0.92, 0.52, 0.20], "l": [1.16, 0.72, 0.14], "sway": 0.01},
	"reload": {"r": [0.70, 0.86, 0.10], "l": [0.86, 1.30, 0.00], "sway": 0.02},
	"jump": {"r": [0.70, 0.66, 0.14], "l": [0.94, 0.82, 0.08], "sway": 0.03},
	"fall": {"r": [0.62, 0.58, 0.06], "l": [0.88, 0.78, 0.02], "sway": 0.05},
	"land": {"r": [0.68, 0.72, 0.10], "l": [0.94, 0.86, 0.06], "sway": 0.04},
	"hurt": {"r": [0.46, 0.40, 0.20], "l": [0.70, 0.62, 0.16], "sway": 0.10},
	"die": {"r": [0.34, 0.28, 0.10], "l": [0.50, 0.40, 0.06], "sway": 0.12},
	"melee": {"r": [0.40, 0.30, 0.10], "l": [0.86, 0.92, 0.04], "sway": 0.05},
	"throw": {"r": [0.34, 0.26, 0.06], "l": [0.66, 0.60, 0.02], "sway": 0.08},
	"point": {"r": [0.60, 0.50, 0.10], "l": [0.70, 0.40, 0.30], "sway": 0.02},
	"inspect": {"r": [0.74, 0.72, 0.18], "l": [0.98, 0.92, 0.10], "sway": 0.02},
}

const PHASE_LAG := {
	"root": 0.0, "spineMid": 0.012, "chest": 0.022, "neck": 0.03, "head": 0.045,
	"clavicle": 0.028, "upperArm": 0.038, "lowerArm": 0.052, "hand": 0.064,
	"hipJoint": 0.014, "upperLeg": 0.02, "lowerLeg": 0.036, "foot": 0.05, "weapon": 0.058,
}


static func smooth01(x: float) -> float:
	return x * x * (3.0 - 2.0 * x)


static func bell(p: float, c: float, w: float) -> float:
	var d: float = minf(absf(p - c), 1.0 - absf(p - c))
	return maxf(0.0, 1.0 - d / w)


static func decay(p: float, k: float) -> float:
	return exp(-p * k)


## Смысловые сигналы клипа. p — фаза 0..1.
static func signals(clip_id: String, p: float) -> Dictionary:
	var s := sin(TAU * p)
	var c := cos(TAU * p)
	match clip_id:
		"idle":
			return {"torsoPitch": 0.10 + 0.05 * s, "torsoRoll": 0.16 * s,
				"torsoTwist": 0.20 * sin(TAU * p + 0.8), "headPitch": -0.06 * s,
				"headYaw": 0.30 * sin(TAU * p * 0.5 + 1.1), "bobY": 0.35 * s, "swayZ": 0.28 * c,
				"rootYaw": 0.10 * s, "legSwing": 0.03 * s, "legBend": -0.08,
				"weaponPitch": 0.10 + 0.04 * s, "weaponRoll": 0.06 * c}
		"breathe":
			var s2 := sin(TAU * p * 2.0)
			return {"torsoPitch": 0.04 * s, "torsoRoll": 0.03 * s2, "torsoTwist": 0.05 * s,
				"headPitch": 0.05 * s - 0.02, "headYaw": 0.10 * sin(TAU * p * 0.5),
				"bobY": 0.22 * s, "swayZ": 0.05 * s2, "legSwing": 0.0, "legBend": 0.08,
				"thighBase": 0.10, "kneeBase": 0.14, "weaponPitch": 0.02 * s, "weaponRoll": 0.02 * s2}
		"walk":
			var s2 := sin(TAU * p * 2.0)
			return {"torsoPitch": 0.24, "torsoRoll": 0.14 * c, "torsoTwist": -0.30 * s,
				"headPitch": -0.04 * s2, "headYaw": 0.12 * sin(TAU * p * 0.5),
				"bobY": 0.55 * absf(s2) - 0.15, "swayZ": 0.35 * c, "rootYaw": 0.06 * s,
				"legSwing": 0.62 * s, "legBend": 0.14 + 0.80 * maxf(0.0, sin(TAU * p + 1.15)),
				"legSpread": 0.10, "weaponPitch": 0.06 * s2, "weaponRoll": 0.10 * c}
		"walkBack":
			return {"torsoPitch": -0.10, "torsoRoll": 0.10 * c, "torsoTwist": 0.22 * s,
				"headPitch": 0.06, "headYaw": 0.25 * sin(TAU * p * 0.3 + 2.0),
				"bobY": 0.40 * absf(sin(TAU * p * 2.0)) - 0.10, "swayZ": 0.28 * c,
				"rootYaw": -0.10 * s, "legSwing": -0.40 * s,
				"legBend": 0.16 + 0.62 * maxf(0.0, sin(TAU * p + 1.6)), "legSpread": 0.08,
				"weaponPitch": 0.10, "weaponRoll": 0.06 * c}
		"strafeL":
			return {"torsoPitch": 0.12, "torsoRoll": -0.22 * c, "torsoTwist": 0.16 * s,
				"headPitch": 0.0, "headYaw": 0.30,
				"bobY": 0.45 * absf(sin(TAU * p * 2.0)) - 0.12, "swayZ": 0.45 * c,
				"rootYaw": 0.16 * c, "legSwing": 0.26 * s, "legBend": 0.30,
				"legSpread": 0.55 + 0.15 * c, "weaponPitch": 0.03, "weaponRoll": -0.10 * c}
		"strafeR":
			return {"torsoPitch": 0.12, "torsoRoll": 0.22 * c, "torsoTwist": -0.16 * s,
				"headPitch": 0.0, "headYaw": -0.30,
				"bobY": 0.45 * absf(sin(TAU * p * 2.0)) - 0.12, "swayZ": -0.45 * c,
				"rootYaw": -0.16 * c, "legSwing": 0.26 * s, "legBend": 0.30,
				"legSpread": 0.55 + 0.15 * c, "weaponPitch": 0.03, "weaponRoll": 0.10 * c}
		"run":
			var s2 := sin(TAU * p * 2.0 + 0.4)
			return {"torsoPitch": 0.95, "torsoRoll": 0.20 * c, "torsoTwist": -0.55 * s,
				"headPitch": -0.45, "headYaw": 0.10 * sin(TAU * p * 0.5),
				"bobY": 0.95 * absf(s2) - 0.30, "swayZ": 0.30 * c, "rootYaw": 0.12 * s,
				"legSwing": 0.92 * s,
				"legBend": 0.30 + 1.35 * maxf(0.0, sin(TAU * p + 0.95)), "legSpread": 0.06,
				"weaponPitch": 0.30, "weaponRoll": 0.22 * c}
		"crouch":
			return {"torsoPitch": 0.70, "torsoRoll": 0.05 * s, "torsoTwist": 0.15 * c,
				"headPitch": -0.35, "headYaw": 0.22 * sin(TAU * p * 0.4),
				"bobY": -1.05 + 0.20 * absf(s), "swayZ": 0.12 * c, "rootYaw": 0.05 * s,
				"legSwing": 0.12 * s, "legBend": 0.25 + 0.12 * absf(s), "legSpread": 0.24,
				"rootDrop": -0.26 + 0.02 * absf(s), "thighBase": 0.55, "kneeBase": 1.05,
				"weaponPitch": 0.12, "weaponRoll": 0.08 * c}
		"aim":
			var s3 := sin(TAU * p * 3.0 + 1.2)
			return {"torsoPitch": 0.34 + 0.04 * s, "torsoRoll": 0.06 * s, "torsoTwist": -0.42,
				"headPitch": -0.18 + 0.03 * s, "headYaw": 0.05 * s3, "bobY": 0.10 * s,
				"swayZ": 0.06 * s3, "legSwing": 0.06 * s, "legBend": -0.16, "legSpread": 0.14,
				"weaponPitch": 0.16 + 0.02 * s3, "weaponRoll": 0.03 * s3}
		"shoot":
			var k := decay(p, 7.5)
			var kick := sin(minf(1.0, p * 3.0) * PI) * k
			return {"torsoPitch": 0.34 - 0.16 * kick, "torsoRoll": 0.03 * kick,
				"torsoTwist": -0.42 - 0.18 * kick, "headPitch": -0.18 + 0.10 * kick,
				"bobY": 0.05 * kick, "swayZ": 0.05 * kick, "rootYaw": 0.05 * kick,
				"legBend": 0.16, "thighBase": 0.16, "kneeBase": 0.22, "legSpread": 0.14,
				"weaponPitch": 0.02 + 0.85 * kick, "weaponRoll": 0.22 * kick}
		"reload":
			var w := sin(PI * minf(1.0, p))
			var drop := bell(p, 0.30, 0.30)
			var mag := bell(p, 0.62, 0.26)
			var seat := bell(p, 0.86, 0.16)
			return {"torsoPitch": 0.30 + 0.18 * w, "torsoRoll": 0.10 * drop - 0.08 * mag,
				"torsoTwist": -0.30 + 0.30 * w, "headPitch": 0.30 * w + 0.06,
				"headYaw": 0.22 * drop - 0.18 * mag, "bobY": 0.12 * w, "swayZ": 0.08 * mag,
				"rootYaw": 0.04 * w, "legBend": -0.10, "legSpread": 0.10,
				"weaponPitch": 0.34 * w + 0.55 * mag - 0.30 * seat,
				"weaponRoll": 0.55 * drop - 0.45 * mag}
		"jump":
			var up := minf(1.0, p * 3.0)
			var out := (p - 0.75) / 0.25 if p > 0.75 else 0.0
			return {"torsoPitch": 0.45 * up - 0.30 * out, "torsoTwist": 0.10,
				"headPitch": -0.32 * up, "bobY": 1.35 * up - 0.40 * out,
				"legSwing": 0.55 * up - 0.55 * out, "legBend": 0.35 + 1.25 * up,
				"legSpread": 0.18, "rootDrop": 0.10 * up, "weaponPitch": 0.25 * up,
				"weaponRoll": 0.10}
		"fall":
			var s2 := sin(TAU * p * 0.5)
			var s3 := sin(TAU * p * 1.7 + 0.6)
			return {"torsoPitch": -0.28 + 0.14 * s2, "torsoRoll": 0.18 * s3,
				"torsoTwist": 0.16 * s2, "headPitch": 0.30 + 0.10 * s3, "headYaw": 0.14 * s2,
				"bobY": -0.10, "swayZ": 0.20 * s3, "rootYaw": 0.10 * s2,
				"legSwing": 0.45 + 0.25 * s2, "legBend": 0.65 + 0.25 * s3, "legSpread": 0.30,
				"weaponPitch": 0.55, "weaponRoll": 0.35 * s2}
		"land":
			var dip := bell(p, 0.18, 0.42)
			return {"torsoPitch": 0.75 * dip, "torsoRoll": 0.06 * dip, "torsoTwist": 0.10 * dip,
				"headPitch": -0.30 * dip, "bobY": -1.15 * dip, "legSwing": 0.20 * dip,
				"legBend": 0.30 * dip, "legSpread": 0.30 * dip, "rootDrop": -0.34 * dip,
				"thighBase": 0.80 * dip, "kneeBase": 1.40 * dip,
				"weaponPitch": 0.45 * dip, "weaponRoll": 0.12 * dip}
		"hurt":
			var k := decay(p, 5.0) * sin(minf(1.0, p * 6.0) * PI)
			return {"torsoPitch": -0.55 * k, "torsoRoll": 0.42 * k, "torsoTwist": 0.38 * k,
				"headPitch": -0.62 * k, "headYaw": -0.55 * k, "bobY": -0.25 * k,
				"swayZ": 0.45 * k, "rootYaw": -0.30 * k, "legSwing": 0.14 * k,
				"legBend": 0.36 * k, "legSpread": 0.25 * k, "rootDrop": -0.10 * k,
				"weaponPitch": -0.55 * k, "weaponRoll": 0.65 * k}
		"die":
			var e := smooth01(minf(1.0, p * 1.15))
			var shake := sin(p * 26.0) * decay(p, 3.2) * 0.18
			return {"torsoPitch": 0.25 + 1.45 * e + shake, "torsoRoll": 0.55 * e + shake,
				"torsoTwist": 0.45 * e, "headPitch": 0.85 * e - 0.20, "headYaw": -0.55 * e,
				"bobY": -1.10 * e, "swayZ": 0.55 * e, "rootYaw": -0.65 * e,
				"rootPitch": 1.35 * e, "rootDrop": -0.30 * e, "legSwing": 0.55 * e,
				"legBend": 0.85 * e, "legSpread": 0.55 * e,
				"weaponPitch": 1.35 * e, "weaponRoll": 0.95 * e}
		"melee":
			var wind := bell(p, 0.22, 0.28)
			var swing := bell(p, 0.52, 0.24)
			var rec := bell(p, 0.76, 0.30)
			return {"torsoPitch": 0.20 + 0.25 * swing, "torsoRoll": -0.25 * wind + 0.42 * swing,
				"torsoTwist": 0.85 * wind - 1.15 * swing + 0.25 * rec, "headPitch": -0.10,
				"headYaw": 0.35 * wind - 0.45 * swing, "bobY": -0.15 * swing,
				"swayZ": -0.18 * wind + 0.30 * swing, "rootYaw": 0.35 * wind - 0.55 * swing,
				"legSwing": 0.30 * swing, "legBend": 0.30, "rootDrop": -0.12 * swing,
				"thighBase": 0.24, "kneeBase": 0.30,
				"legSpread": -0.30 * wind + 0.35 * swing,
				"weaponPitch": 0.75 * wind - 1.25 * swing,
				"weaponRoll": -0.65 * wind + 0.95 * swing}
		"throw":
			var wind := bell(p, 0.30, 0.34)
			var rel := bell(p, 0.62, 0.22)
			var fol := bell(p, 0.78, 0.25)
			return {"torsoPitch": -0.35 * wind + 0.55 * rel + 0.25 * fol,
				"torsoRoll": -0.30 * wind + 0.35 * rel,
				"torsoTwist": -0.75 * wind + 1.05 * rel,
				"headPitch": -0.20 * wind + 0.25 * rel, "headYaw": 0.30 * wind - 0.40 * rel,
				"bobY": -0.55 * wind + 0.30 * rel, "swayZ": -0.25 * wind + 0.40 * rel,
				"rootYaw": -0.45 * wind + 0.65 * rel, "legSwing": -0.20 * wind + 0.35 * rel,
				"legBend": 0.40, "rootDrop": -0.10 * wind, "thighBase": 0.22, "kneeBase": 0.30,
				"legSpread": 0.30, "weaponPitch": -0.65 * wind + 0.85 * rel,
				"weaponRoll": -0.55 * wind + 0.75 * rel}
		"point":
			var e := bell(p, 0.30, 0.55)
			return {"torsoPitch": 0.10, "torsoRoll": 0.10 * e, "torsoTwist": -0.30 * e,
				"headPitch": -0.10 * e, "headYaw": -0.35 * e, "bobY": 0.08 * e,
				"swayZ": 0.10 * e, "rootYaw": -0.12 * e, "legSwing": 0.05 * e,
				"legBend": 0.10, "legSpread": 0.18, "weaponPitch": 0.20 * e,
				"weaponRoll": 0.10 * e}
		"inspect":
			var spin := sin(TAU * p * 1.2)
			var lift := bell(p, 0.42, 0.55)
			return {"torsoPitch": 0.18 + 0.10 * lift, "torsoRoll": 0.10 * spin * lift,
				"torsoTwist": 0.35 * lift, "headPitch": 0.35 * lift, "headYaw": 0.30 * lift,
				"bobY": 0.10 * lift, "swayZ": 0.10 * spin * lift, "rootYaw": 0.10 * lift,
				"legBend": 0.10, "thighBase": 0.08, "kneeBase": 0.12, "legSpread": 0.12,
				"weaponPitch": 0.35 * lift, "weaponRoll": 1.25 * spin * lift}
	return {}


## Позы рук из ARM_POSE поверх сигналов
static func apply_arms(clip_id: String, sg: Dictionary, p_s: float) -> Dictionary:
	if not ARM_POSE.has(clip_id):
		return sg
	var ap: Dictionary = ARM_POSE[clip_id]
	var sway: float = sin(TAU * p_s) * float(ap["sway"]) if float(ap["sway"]) > 0.0 else 0.0
	var r: Array = ap["r"]
	var l: Array = ap["l"]
	sg["armSwingR"] = float(r[0]) + sway
	sg["armBendR"] = float(r[1])
	sg["armRaiseR"] = float(r[2])
	sg["armSwingL"] = float(l[0]) - sway * 0.5
	sg["armBendL"] = float(l[1])
	sg["armRaiseL"] = float(l[2])
	sg["armSwing"] = (sg["armSwingR"] + sg["armSwingL"]) * 0.5
	sg["armBend"] = (sg["armBendR"] + sg["armBendL"]) * 0.5
	sg["armRaise"] = (sg["armRaiseR"] + sg["armRaiseL"]) * 0.5
	return sg


static func _pick(sg: Dictionary, name: String, side: int) -> float:
	if side != 0:
		var key: String = name + ("L" if side == 1 else "R")
		if sg.has(key):
			return float(sg[key])
	return float(sg.get(name, 0.0))


## Раскладка сигналов по костям: для каждой роли — свои каналы и веса
static func map_role(role: String, sg: Dictionary, side: int) -> Dictionary:
	var torso_pitch := float(sg.get("torsoPitch", 0.0))
	var torso_twist := float(sg.get("torsoTwist", 0.0))
	var torso_roll := float(sg.get("torsoRoll", 0.0))
	var head_pitch := float(sg.get("headPitch", 0.0))
	var head_yaw := float(sg.get("headYaw", 0.0))
	match role:
		"root":
			return {"rx": torso_pitch * 0.30 + float(sg.get("rootPitch", 0.0)),
				"ry": float(sg.get("rootYaw", 0.0)), "rz": torso_roll * 0.30,
				"ty": float(sg.get("bobY", 0.0)) * 0.07 + float(sg.get("rootDrop", 0.0)),
				"tz": float(sg.get("swayZ", 0.0)) * 0.05}
		"spineMid":
			return {"rx": torso_pitch * 0.34, "ry": torso_twist * 0.34, "rz": torso_roll * 0.36}
		"chest":
			return {"rx": torso_pitch * 0.42, "ry": torso_twist * 0.48, "rz": torso_roll * 0.40}
		"neck":
			return {"rx": -torso_pitch * 0.18 + head_pitch * 0.30,
				"ry": head_yaw * 0.34 - torso_twist * 0.16, "rz": torso_roll * 0.16}
		"head":
			return {"rx": head_pitch - torso_pitch * 0.16, "ry": head_yaw * 0.62,
				"rz": torso_roll * 0.24}
		"clavicle":
			return {"rx": _pick(sg, "armSwing", side) * 0.16,
				"ry": _pick(sg, "armBend", side) * 0.10,
				"rz": _pick(sg, "armRaise", side) * 0.30}
		"upperArm":
			# +rx уводит руку назад (персонаж смотрит в +Z) -> подъём вперёд = -rx
			return {"rx": -_pick(sg, "armSwing", side),
				"ry": _pick(sg, "armBend", side) * 0.10,
				"rz": -_pick(sg, "armRaise", side) * 0.55}
		"lowerArm":
			return {"rx": -_pick(sg, "armBend", side), "ry": 0.0,
				"rz": -_pick(sg, "armRaise", side) * 0.10}
		"hand":
			return {"rx": -_pick(sg, "wrist", side), "ry": _pick(sg, "armBend", side) * 0.08,
				"rz": -_pick(sg, "wrist", side) * 0.30}
		"hipJoint":
			return {"rx": float(sg.get("legSwing", 0.0)) * 0.22, "ry": 0.0,
				"rz": float(sg.get("legSpread", 0.0)) * 0.34}
		"upperLeg":
			return {"rx": -(float(sg.get("legSwing", 0.0)) + float(sg.get("thighBase", 0.0))),
				"ry": 0.0, "rz": -float(sg.get("legSpread", 0.0)) * 0.5}
		"lowerLeg":
			return {"rx": maxf(0.02, float(sg.get("legBend", 0.0)) + float(sg.get("kneeBase", 0.0))),
				"ry": 0.0, "rz": 0.0}
		"foot":
			var knee_base := float(sg.get("kneeBase", 0.0))
			return {"rx": -(float(sg.get("legSwing", 0.0)) + float(sg.get("thighBase", 0.0))) * 0.30
				+ (float(sg.get("legBend", 0.0)) + knee_base) * 0.34
				- (0.30 if knee_base != 0.0 else 0.0),
				"ry": 0.0, "rz": float(sg.get("legSpread", 0.0)) * 0.28}
		"weapon":
			return {"rx": float(sg.get("weaponPitch", 0.0)),
				"ry": float(sg.get("weaponPitch", 0.0)) * 0.16,
				"rz": float(sg.get("weaponRoll", 0.0))}
	return {}


# детерминированный ГПСЧ (xorshift) — один и тот же клип всегда одинаковый
class Rng:
	var s: int = 1

	func _init(seed: int) -> void:
		s = seed if seed != 0 else 1

	func next() -> float:
		s ^= (s << 13) & 0xFFFFFFFF
		s = s & 0xFFFFFFFF
		s ^= s >> 17
		s ^= (s << 5) & 0xFFFFFFFF
		s = s & 0xFFFFFFFF
		return float(s) / 4294967296.0

	func range_f() -> float:
		return next()


static func hash(text: String) -> int:
	var h: int = 2166136261
	for i in text.length():
		h = h ^ text.unicode_at(i)
		h = (h * 16777619) & 0xFFFFFFFF
	return h & 0xFFFFFFFF


const SAMPLES := 13


## Кривая пары (часть, клип, вариант): {канал: [[t, v], ...]}
static func clip_curve(part: Dictionary, clip: Dictionary, variant_index: int) -> Dictionary:
	var v: Dictionary = VARIANTS[clampi(variant_index, 0, VARIANTS.size() - 1)]
	var clip_id: String = clip["id"]
	var role: String = part["role"]
	var seed := hash("%s|%s|%s" % [part["id"], clip_id, v["id"]])
	var rnd := Rng.new(seed)
	var jit := [rnd.next() - 0.5, rnd.next() - 0.5, rnd.next() - 0.5]
	var lag: float = float(PHASE_LAG.get(role, 0.0)) * (0.6 + float(v["speed"]) * 0.4)
	var side: int = int(part.get("side", 0))
	var asym: float = 1.0 + float(v["asym"]) * side
	var limp: float = float(v["limp"]) * (0.28 if side == 1 else (-0.20 if side == -1 else 0.0))
	var gains: Dictionary = part["gain"]
	var channels: Array = ["rx", "ry", "rz", "ty", "tz"] if role == "root" else ["rx", "ry", "rz"]
	var out := {}
	var is_loop: bool = clip["loop"]
	for ci in channels.size():
		var ch: String = channels[ci]
		var frames: Array = []
		for i in SAMPLES:
			var t := float(i) / float(SAMPLES - 1)
			var p: float = t * float(v["speed"])
			p = p - floorf(p)
			var p_s: float = fposmod(t - lag * 0.5, 1.0)
			var phase_for_sig: float = p_s if is_loop else minf(1.0, t)
			var base := apply_arms(clip_id, signals(clip_id, phase_for_sig), p_s)
			var m := map_role(role, base, side)
			var val := float(m.get(ch, 0.0))
			if ch == "rx" or ch == "rz":
				val *= asym
			if limp != 0.0 and ch == "rx":
				val += limp * (0.35 + 0.25 * sin(TAU * p_s))
			if float(v["lean"]) != 0.0 and ch == "rx":
				val += float(v["lean"]) * (0.10 if role == "root" else 0.55)
			if float(v["lean"]) != 0.0 and ch == "rz" and role != "root":
				val += float(v["lean"]) * 0.18 * float(side if side != 0 else 1)
			val += float(v["jitter"]) * float(jit[ci % 3]) * sin(TAU * (p_s * 2.0 + float(jit[0])))
			if v["id"] == "care" and role == "head" and ch == "ry":
				val += 0.35 * sin(TAU * p_s * 0.5)
			val *= float(gains.get(ch, 1.0))
			frames.append([snappedf(t, 0.0001), snappedf(val, 0.00001)])
		frames[0][0] = 0.0
		frames[SAMPLES - 1][0] = 1.0
		out[ch] = frames
	return out


static func totals() -> Dictionary:
	return {
		"parts": PARTS.size(),
		"clips": CLIPS.size(),
		"variants": VARIANTS.size(),
		"per_part": CLIPS.size() * VARIANTS.size(),
		"total": PARTS.size() * CLIPS.size() * VARIANTS.size(),
	}


static func part_by_id(id: String) -> Dictionary:
	for p in PARTS:
		if p["id"] == id:
			return p
	return {}


static func clip_by_id(id: String) -> Dictionary:
	for c in CLIPS:
		if c["id"] == id:
			return c
	return {}


static func clip_index(id: String) -> int:
	for i in CLIPS.size():
		if CLIPS[i]["id"] == id:
			return i
	return -1


# ---------------------------------------------------------------------------
# 7. ОРУЖИЕ
# ---------------------------------------------------------------------------
const WEAPONS: Array[Dictionary] = [
	{"id": "pistol", "name": "ПМ-9 «Оса»", "short": "ОСА", "damage": 26.0, "headshot": 3.0,
		"rpm": 260.0, "auto": false, "mag": 12, "reserve": 120, "spread": 0.011, "ads_spread": 0.004,
		"recoil": 0.030, "reload": 1.55, "range": 90.0, "pellets": 1, "sound": "pistol",
		"kick": 0.024, "ads_fov": 58.0, "weight": 0.9, "tracer": Color("#ffd27a")},
	{"id": "smg", "name": "КП-45 «Стриж»", "short": "СТРИЖ", "damage": 18.0, "headshot": 2.4,
		"rpm": 780.0, "auto": true, "mag": 32, "reserve": 224, "spread": 0.024, "ads_spread": 0.010,
		"recoil": 0.020, "reload": 1.85, "range": 80.0, "pellets": 1, "sound": "smg",
		"kick": 0.016, "ads_fov": 55.0, "weight": 1.0, "tracer": Color("#ffe08f")},
	{"id": "rifle", "name": "АК-74 «Гроза»", "short": "ГРОЗА", "damage": 31.0, "headshot": 2.6,
		"rpm": 620.0, "auto": true, "mag": 30, "reserve": 210, "spread": 0.019, "ads_spread": 0.005,
		"recoil": 0.028, "reload": 2.10, "range": 150.0, "pellets": 1, "sound": "rifle",
		"kick": 0.022, "ads_fov": 48.0, "weight": 1.3, "tracer": Color("#ffcf6b")},
	{"id": "shotgun", "name": "ТОЗ-12 «Молот»", "short": "МОЛОТ", "damage": 14.0, "headshot": 1.7,
		"rpm": 78.0, "auto": false, "mag": 7, "reserve": 42, "spread": 0.075, "ads_spread": 0.052,
		"recoil": 0.070, "reload": 2.55, "range": 42.0, "pellets": 8, "sound": "shotgun",
		"kick": 0.055, "ads_fov": 62.0, "weight": 1.5, "tracer": Color("#ffb86b")},
	{"id": "dmr", "name": "СВД «Игла»", "short": "ИГЛА", "damage": 74.0, "headshot": 2.2,
		"rpm": 210.0, "auto": false, "mag": 10, "reserve": 60, "spread": 0.010, "ads_spread": 0.0015,
		"recoil": 0.060, "reload": 2.35, "range": 260.0, "pellets": 1, "sound": "dmr",
		"kick": 0.048, "ads_fov": 34.0, "weight": 1.7, "tracer": Color("#fff2c4"), "scope": true},
]

# точки хвата: правая рука — рукоять, левая — цевьё
const GRIPS := {
	"pistol": {"r": Vector3(0.0, -0.075, -0.048), "l": Vector3(-0.02, -0.06, 0.0), "shoulder": 0.30},
	"smg": {"r": Vector3(0.0, -0.062, -0.050), "l": Vector3(0.0, -0.055, 0.135), "shoulder": 0.30},
	"rifle": {"r": Vector3(0.0, -0.070, -0.045), "l": Vector3(0.0, -0.062, 0.255), "shoulder": 0.32},
	"shotgun": {"r": Vector3(0.0, -0.072, -0.040), "l": Vector3(0.0, -0.060, 0.300), "shoulder": 0.34},
	"dmr": {"r": Vector3(0.0, -0.070, -0.050), "l": Vector3(0.0, -0.060, 0.320), "shoulder": 0.34},
}


static func weapon_by_id(id: String) -> Dictionary:
	for w in WEAPONS:
		if w["id"] == id:
			return w
	return WEAPONS[2]


# ---------------------------------------------------------------------------
# 8. БОЕВИКИ («больно думать»)
# ---------------------------------------------------------------------------
const ENEMY_TYPES: Array[Dictionary] = [
	{"id": "grunt", "name": "Боец", "short": "БОЕЦ", "hp": 100.0, "armor": 0.0, "speed": 2.5,
		"sprint": 4.4, "accuracy": 0.52, "reaction": 0.55, "think_time": 0.85, "think_quality": 0.72,
		"aggression": 0.55, "prefer_range": [10.0, 26.0], "weapon": "smg", "score": 100,
		"body_color": Color("#6b7355"), "gear_color": Color("#3a3f33"), "skin": Color("#c9a184"),
		"scale": 1.0, "tactics": ["cover", "advance", "suppress"]},
	{"id": "sniper", "name": "Стрелок", "short": "СТРЕЛОК", "hp": 85.0, "armor": 0.0, "speed": 2.2,
		"sprint": 4.0, "accuracy": 0.86, "reaction": 0.9, "think_time": 1.35, "think_quality": 0.9,
		"aggression": 0.35, "prefer_range": [30.0, 70.0], "weapon": "dmr", "score": 150,
		"body_color": Color("#555f52"), "gear_color": Color("#2f3730"), "skin": Color("#c09a7e"),
		"scale": 1.0, "tactics": ["hold", "flank", "peek"]},
	{"id": "heavy", "name": "Тяжёлый", "short": "ТЯЖЁЛЫЙ", "hp": 190.0, "armor": 60.0, "speed": 1.9,
		"sprint": 3.2, "accuracy": 0.44, "reaction": 0.75, "think_time": 1.2, "think_quality": 0.55,
		"aggression": 0.85, "prefer_range": [6.0, 18.0], "weapon": "shotgun", "score": 180,
		"body_color": Color("#5b5348"), "gear_color": Color("#2b2b2b"), "skin": Color("#bf9a80"),
		"scale": 1.12, "tactics": ["advance", "suppress", "melee"]},
	{"id": "scout", "name": "Разведчик", "short": "РАЗВЕДЧИК", "hp": 70.0, "armor": 10.0, "speed": 3.1,
		"sprint": 5.6, "accuracy": 0.46, "reaction": 0.4, "think_time": 0.5, "think_quality": 0.62,
		"aggression": 0.7, "prefer_range": [7.0, 20.0], "weapon": "smg", "score": 120,
		"body_color": Color("#77685a"), "gear_color": Color("#3b3129"), "skin": Color("#d0a789"),
		"scale": 0.94, "tactics": ["flank", "rush", "grenade"]},
	{"id": "officer", "name": "Командир", "short": "КОМАНДИР", "hp": 130.0, "armor": 30.0, "speed": 2.4,
		"sprint": 4.2, "accuracy": 0.68, "reaction": 0.6, "think_time": 0.7, "think_quality": 0.95,
		"aggression": 0.6, "prefer_range": [14.0, 34.0], "weapon": "rifle", "score": 250,
		"body_color": Color("#4a5548"), "gear_color": Color("#22281f"), "skin": Color("#c8a186"),
		"scale": 1.04, "tactics": ["order", "flank", "cover", "suppress"]},
	{"id": "boss", "name": "«Архитектор»", "short": "АРХИТЕКТОР", "hp": 620.0, "armor": 120.0,
		"speed": 2.7, "sprint": 4.8, "accuracy": 0.72, "reaction": 0.45, "think_time": 0.55,
		"think_quality": 1.0, "aggression": 0.8, "prefer_range": [10.0, 30.0], "weapon": "rifle",
		"score": 1000, "body_color": Color("#2f3a40"), "gear_color": Color("#141a1d"),
		"skin": Color("#b08b73"), "scale": 1.16,
		"tactics": ["order", "flank", "suppress", "grenade", "peek"]},
]


static func enemy_by_id(id: String) -> Dictionary:
	for e in ENEMY_TYPES:
		if e["id"] == id:
			return e
	return ENEMY_TYPES[0]


# ---------------------------------------------------------------------------
# 9. МИССИИ
# ---------------------------------------------------------------------------
const MISSIONS: Array[Dictionary] = [
	{"id": "m1", "index": 1, "name": "Пепел на складах", "map": "depot", "type": "eliminate",
		"count": 6, "briefing": "Боевики заняли складской терминал. Зачистите сектор и не дайте им уйти вглубь.",
		"loadout": ["pistol", "smg"], "waves": 1, "time": 0.0,
		"enemies": ["grunt", "grunt", "scout", "grunt", "grunt", "officer"],
		"tip": "Стреляйте в голову и используйте укрытия: ящики держат пули."},
	{"id": "m2", "index": 2, "name": "Тихий этаж", "map": "depot", "type": "eliminate",
		"count": 8, "briefing": "Снайпер на верхнем уровне простреливает двор. Уберите его и зачистите терминал.",
		"loadout": ["smg", "rifle"], "waves": 1, "time": 0.0,
		"enemies": ["sniper", "grunt", "grunt", "scout", "grunt", "heavy", "grunt", "officer"],
		"tip": "Стрелок думает дольше остальных — используйте паузу между его выстрелами."},
	{"id": "m3", "index": 3, "name": "Караван", "map": "convoy", "type": "destroy", "count": 3,
		"briefing": "Уничтожьте три ящика с взрывчаткой на конвое. Охрана будет мешать.",
		"loadout": ["rifle", "shotgun"], "waves": 1, "time": 0.0,
		"enemies": ["grunt", "scout", "heavy", "grunt", "grunt", "officer"],
		"tip": "Ящики подсвечены. Очередь в упор быстрее, чем перезарядка."},
	{"id": "m4", "index": 4, "name": "Держать коридор", "map": "convoy", "type": "survive",
		"count": 0, "waves": 3, "time": 90.0,
		"briefing": "Продержитесь 90 секунд, пока группа эвакуации поднимает борт. Враги идут волнами.",
		"loadout": ["rifle", "smg"],
		"enemies": ["grunt", "grunt", "scout", "grunt"],
		"tip": "Тяжёлые идут последними. Берегите патроны до третьей волны."},
	{"id": "m5", "index": 5, "name": "Порт", "map": "harbor", "type": "extract", "count": 0,
		"briefing": "Прорывайтесь к точке эвакуации на другой стороне порта. Отходить нужно быстро.",
		"loadout": ["rifle", "shotgun"], "waves": 1, "time": 0.0,
		"enemies": ["grunt", "sniper", "scout", "grunt", "officer"],
		"tip": "Не останавливайтесь. На бегу стреляйте короткими очередями."},
	{"id": "m6", "index": 6, "name": "Архитектор", "map": "harbor", "type": "boss", "count": 1,
		"briefing": "«Архитектор» ждёт в диспетчерской вышке. Он думает быстрее всех. Докажите, что этого мало.",
		"loadout": ["rifle", "dmr"], "waves": 1, "time": 0.0,
		"enemies": ["boss", "grunt", "grunt", "scout", "sniper", "heavy"],
		"tip": "Командиры отдают приказы: убивайте их первыми, и толпа теряет строй."},
]

# ---------------------------------------------------------------------------
# 10. КАРТЫ — полигоны (обведённые точки), а не набор кубов
# ---------------------------------------------------------------------------
const MAPS := {
	"depot": {
		"name": "Складской терминал", "size": 76.0, "fog": Color("#1a1410"), "sky": Color("#2a1f19"),
		"ground": Color("#3a3128"), "accent": Color("#4a3a28"),
		"sun": Color("#ffd0a0"), "ambient": Color("#5a4a3a"), "sun_pos": Vector3(-42, 58, 26),
		"dust": 0.9,
		"wall_colors": {"wall": Color("#4a4238"), "roof": Color("#2f2b26"), "trim": Color("#5a5044")},
		"buildings": [
			{"poly": [Vector2(-24, -20), Vector2(-9, -22), Vector2(-7, -9), Vector2(-22, -8)],
				"h": 4.2, "roof": "flat", "wall": Color("#4d4438")},
			{"poly": [Vector2(6, -26), Vector2(20, -25), Vector2(21, -13), Vector2(7, -12)],
				"h": 5.0, "roof": "gable", "ridge": 0.32, "wall": Color("#463f35")},
			{"poly": [Vector2(14, 6), Vector2(27, 5), Vector2(28, 19), Vector2(16, 20)],
				"h": 3.6, "roof": "flat", "wall": Color("#51483b")},
			{"poly": [Vector2(-30, 12), Vector2(-18, 11), Vector2(-17, 23), Vector2(-29, 24)],
				"h": 4.6, "roof": "gable", "wall": Color("#443c33")},
			{"poly": [Vector2(24, -32), Vector2(32, -30), Vector2(33, -21), Vector2(25, -22)],
				"h": 2.8, "roof": "flat", "wall": Color("#4a4034")},
		],
		"towers": [{"x": 26.0, "z": -2.0, "w": 7.0, "h": 7.5}],
		"barriers": [
			{"x": -4.0, "z": -14.0, "a": 0.1, "len": 5.6}, {"x": 6.0, "z": 6.0, "a": 1.3, "len": 5.2},
			{"x": -18.0, "z": 4.0, "a": 0.35, "len": 5.0}, {"x": 18.0, "z": 14.0, "a": -0.4, "len": 4.6},
			{"x": -12.0, "z": 22.0, "a": 0.9, "len": 5.4},
		],
		"sandbags": [
			{"x": -26.0, "z": -30.0, "a": 0.2, "len": 5.5}, {"x": 20.0, "z": 26.0, "a": -0.3, "len": 5.0},
			{"x": 2.0, "z": 18.0, "a": 1.1, "len": 4.4},
		],
		"barrels": [Vector2(-16, 12), Vector2(-14.6, 12.4), Vector2(-15.4, 13.6), Vector2(22, 8),
			Vector2(23.2, 9.1), Vector2(-26, -6), Vector2(10, 24)],
		"rocks": [Vector3(-32, 0, 1.4), Vector3(30, 24, 1.1), Vector3(8, -30, 1.0), Vector3(-8, 30, 1.2)],
		"stacks": [Vector2(-20, 26), Vector2(12, -6)],
		"road": [{"x": 0.0, "z": 2.0, "w": 7.0, "l": 66.0, "a": 0.0},
			{"x": -4.0, "z": -18.0, "w": 5.0, "l": 34.0, "a": 1.57}],
		"spawns": [Vector2(-30, -30), Vector2(30, -30), Vector2(-30, 30), Vector2(30, 30),
			Vector2(0, -31), Vector2(0, 31), Vector2(30, 2), Vector2(-30, 2)],
		"extracts": [{"x": -30.0, "z": -30.0, "r": 4.0}],
		"monoliths": [
			{"x": -6.0, "z": -4.0, "a": 0.18, "model": 131},
			{"x": 10.0, "z": 12.0, "a": -0.42, "model": 1024},
			{"x": -20.0, "z": -14.0, "a": 0.86, "model": 2671},
			{"x": 22.0, "z": 3.0, "a": 1.24, "model": 5108},
			{"x": -2.0, "z": 27.0, "a": -0.12, "model": 7422},
			{"x": 15.0, "z": -18.0, "a": 0.55, "model": 9613},
		],
		"boxes": [Vector2(-8, -26), Vector2(18, 26), Vector2(26, -26)],
	},
	"convoy": {
		"name": "Караванный тракт", "size": 84.0, "fog": Color("#181a14"), "sky": Color("#2b2a24"),
		"ground": Color("#3b3a2e"), "accent": Color("#4d4a36"),
		"sun": Color("#ffe0a8"), "ambient": Color("#5c5a44"), "sun_pos": Vector3(30, 62, -40),
		"dust": 0.7,
		"wall_colors": {"wall": Color("#4f4a3a"), "roof": Color("#322f28"), "trim": Color("#5e5844")},
		"buildings": [
			{"poly": [Vector2(-26, -24), Vector2(-10, -26), Vector2(-8, -12), Vector2(-24, -10)],
				"h": 3.4, "roof": "gable", "ridge": 0.42, "wall": Color("#4c4636")},
			{"poly": [Vector2(8, -30), Vector2(24, -28), Vector2(26, -16), Vector2(10, -14)],
				"h": 4.4, "roof": "flat", "wall": Color("#464034")},
			{"poly": [Vector2(-4, 14), Vector2(10, 12), Vector2(12, 26), Vector2(-2, 28)],
				"h": 3.0, "roof": "flat", "wall": Color("#514a38")},
			{"poly": [Vector2(24, 6), Vector2(36, 8), Vector2(34, 22), Vector2(22, 20)],
				"h": 5.2, "roof": "gable", "wall": Color("#433d31")},
			{"poly": [Vector2(-34, 22), Vector2(-20, 24), Vector2(-22, 34), Vector2(-36, 32)],
				"h": 3.8, "roof": "flat", "wall": Color("#4a4433")},
		],
		"towers": [],
		"barriers": [
			{"x": -2.0, "z": -4.0, "a": 0.05, "len": 6.2}, {"x": 20.0, "z": 2.0, "a": 1.25, "len": 5.4},
			{"x": -24.0, "z": 0.0, "a": -0.35, "len": 5.0}, {"x": 6.0, "z": 22.0, "a": 0.8, "len": 5.6},
			{"x": -30.0, "z": 12.0, "a": 0.3, "len": 4.8},
		],
		"sandbags": [
			{"x": 0.0, "z": 6.0, "a": 0.0, "len": 6.0}, {"x": 32.0, "z": -8.0, "a": 0.5, "len": 5.2},
			{"x": -12.0, "z": 34.0, "a": -0.2, "len": 4.6},
		],
		"barrels": [Vector2(-16, 6), Vector2(-14.7, 6.6), Vector2(14, 14), Vector2(15.2, 14.2),
			Vector2(30, 30), Vector2(28.8, 31.2)],
		"rocks": [Vector3(-38, -4, 1.5), Vector3(38, 20, 1.2), Vector3(0, -34, 1.1)],
		"stacks": [Vector2(-18, -32), Vector2(26, -2)],
		"road": [{"x": 2.0, "z": 0.0, "w": 8.0, "l": 74.0, "a": 1.57},
			{"x": 0.0, "z": -20.0, "w": 6.0, "l": 40.0, "a": 0.0}],
		"spawns": [Vector2(-34, -34), Vector2(34, 34), Vector2(-34, 34), Vector2(34, -34),
			Vector2(0, -36), Vector2(0, 36)],
		"extracts": [{"x": 34.0, "z": -34.0, "r": 4.5}],
		"monoliths": [
			{"x": -10.0, "z": 8.0, "a": 0.3, "model": 4021},
			{"x": 14.0, "z": -6.0, "a": -0.7, "model": 6688},
			{"x": 4.0, "z": 22.0, "a": 1.1, "model": 8841},
		],
		"boxes": [Vector2(-2, -28), Vector2(30, 6), Vector2(-30, 24)],
	},
	"harbor": {
		"name": "Порт", "size": 90.0, "fog": Color("#101820"), "sky": Color("#1d2733"),
		"ground": Color("#2f3540"), "accent": Color("#3d4654"),
		"sun": Color("#a8c8ff"), "ambient": Color("#4a5a6c"), "sun_pos": Vector3(-46, 52, 44),
		"dust": 0.5,
		"wall_colors": {"wall": Color("#3f4852"), "roof": Color("#2a3138"), "trim": Color("#4d5765")},
		"buildings": [
			{"poly": [Vector2(-30, -26), Vector2(-8, -30), Vector2(-6, -10), Vector2(-28, -6)],
				"h": 6.2, "roof": "flat", "wall": Color("#414a54")},
			{"poly": [Vector2(10, -22), Vector2(30, -18), Vector2(32, 0), Vector2(12, -2)],
				"h": 5.4, "roof": "gable", "ridge": 0.26, "wall": Color("#3c454f")},
			{"poly": [Vector2(-16, 10), Vector2(0, 8), Vector2(2, 26), Vector2(-18, 28)],
				"h": 4.8, "roof": "flat", "wall": Color("#444d57")},
			{"poly": [Vector2(20, 14), Vector2(34, 16), Vector2(32, 32), Vector2(18, 30)],
				"h": 7.0, "roof": "gable", "wall": Color("#39424c")},
			{"poly": [Vector2(-40, 8), Vector2(-32, 6), Vector2(-30, 20), Vector2(-38, 22)],
				"h": 3.2, "roof": "flat", "wall": Color("#47505a")},
		],
		"towers": [{"x": -28.0, "z": -34.0, "w": 8.0, "h": 9.0}, {"x": 34.0, "z": -34.0, "w": 7.0, "h": 7.0}],
		"barriers": [
			{"x": -20.0, "z": -4.0, "a": 0.5, "len": 5.8}, {"x": 8.0, "z": 4.0, "a": -0.2, "len": 5.2},
			{"x": 30.0, "z": 2.0, "a": 0.9, "len": 5.0}, {"x": -6.0, "z": 18.0, "a": 0.15, "len": 5.6},
			{"x": 20.0, "z": 22.0, "a": -0.5, "len": 4.8}, {"x": 0.0, "z": -34.0, "a": 0.0, "len": 6.4},
		],
		"sandbags": [
			{"x": 14.0, "z": -10.0, "a": 1.2, "len": 5.4}, {"x": -24.0, "z": 30.0, "a": 0.4, "len": 5.0},
			{"x": 36.0, "z": 6.0, "a": -0.3, "len": 4.4},
		],
		"barrels": [Vector2(-38, -8), Vector2(-36.6, -7.4), Vector2(-37.4, -9.4), Vector2(36, 8),
			Vector2(34.7, 9), Vector2(0, 32), Vector2(2, 32.6)],
		"rocks": [Vector3(-42, 24, 1.6), Vector3(42, 24, 1.3), Vector3(-6, 40, 1.2), Vector3(16, -38, 1.4)],
		"stacks": [Vector2(-8, 34), Vector2(22, -8), Vector2(38, -16)],
		"road": [{"x": -2.0, "z": 0.0, "w": 9.0, "l": 82.0, "a": 1.57},
			{"x": -18.0, "z": -18.0, "w": 7.0, "l": 50.0, "a": 0.6}],
		"spawns": [Vector2(-36, 36), Vector2(36, -36), Vector2(-36, -36), Vector2(36, 36),
			Vector2(0, -38), Vector2(0, 38), Vector2(38, 0), Vector2(-38, 0)],
		"extracts": [{"x": -38.0, "z": 38.0, "r": 5.0}],
		"monoliths": [
			{"x": -12.0, "z": 6.0, "a": 0.12, "model": 2199},
			{"x": 16.0, "z": -10.0, "a": 0.9, "model": 5077},
		],
		"boxes": [],
	},
}


## Прямоугольники коллизий, выведенные из полигонов зданий + границы карты.
## Возвращает массив словарей {x, z, hw, hd, h, kind}.
## проёмы в стенах здания: окна на высоте пояса/груди по периметру.
## Каждый проём — прямоугольник {dy0, dy1, du0, du1, dv0, dv1} относительно центра.
static func _window_holes(cx: float, cz: float, hw: float, hd: float, h: float) -> Array:
	var holes: Array = []
	var dy0: float = minf(h - 0.6, 1.02)
	var dy1: float = minf(h - 0.25, 1.92)
	if dy1 - dy0 < 0.35:
		return holes
	var step := 3.4
	var margin := 1.0
	var half_w := 0.28
	var nx: int = maxi(1, int(floor((hw * 2.0 - margin * 2.0) / step)))
	for i in nx:
		var u: float = -hw + margin + step * (float(i) + 0.5)
		holes.append({"dy0": dy0, "dy1": dy1, "du0": u - half_w, "du1": u + half_w,
			"dv0": -hd - 0.01, "dv1": hd + 0.01})
	var nz: int = maxi(1, int(floor((hd * 2.0 - margin * 2.0) / step)))
	for i in nz:
		var v: float = -hd + margin + step * (float(i) + 0.5)
		holes.append({"dy0": dy0, "dy1": dy1, "du0": -hw - 0.01, "du1": hw + 0.01,
			"dv0": v - half_w, "dv1": v + half_w})
	return holes


static func map_colliders(map_id: String) -> Array:
	var m: Dictionary = MAPS.get(map_id, MAPS["depot"])
	var out: Array = []
	for b in m["buildings"]:
		var min_x := 1e9
		var max_x := -1e9
		var min_z := 1e9
		var max_z := -1e9
		for p in b["poly"]:
			min_x = minf(min_x, p.x)
			max_x = maxf(max_x, p.x)
			min_z = minf(min_z, p.y)
			max_z = maxf(max_z, p.y)
		var cx: float = (min_x + max_x) * 0.5
		var cz: float = (min_z + max_z) * 0.5
		var hw: float = (max_x - min_x) * 0.5
		var hd: float = (max_z - min_z) * 0.5
		out.append({"x": cx, "z": cz, "hw": hw, "hd": hd, "h": float(b["h"]),
			"kind": "building", "holes": _window_holes(cx, cz, hw, hd, float(b["h"]))})
	for t in m["towers"]:
		out.append({"x": t["x"], "z": t["z"], "hw": float(t["w"]) * 0.36,
			"hd": float(t["w"]) * 0.36, "h": float(t["h"]), "kind": "tower"})
	for b in m["barriers"]:
		var c: float = absf(cos(float(b["a"])))
		var s: float = absf(sin(float(b["a"])))
		var half: float = float(b["len"]) * 0.5
		out.append({"x": b["x"], "z": b["z"], "hw": half * c + 0.3 * s,
			"hd": half * s + 0.3 * c, "h": 1.18, "kind": "barrier"})
	for sb in m["sandbags"]:
		var c2: float = absf(cos(float(sb["a"])))
		var s2: float = absf(sin(float(sb["a"])))
		var half2: float = float(sb["len"]) * 0.5
		# мешки низкие: стоя не укрывают, присевший — почти полностью
		out.append({"x": sb["x"], "z": sb["z"], "hw": half2 * c2 + 0.3 * s2,
			"hd": half2 * s2 + 0.3 * c2, "h": 0.72, "kind": "sandbag", "stand_low": true})
	for p in m["barrels"]:
		out.append({"x": p.x, "z": p.y, "hw": 0.48, "hd": 0.48, "h": 1.15, "kind": "barrel"})
	for p in m["rocks"]:
		out.append({"x": p.x, "z": p.y, "hw": 0.7 * p.z, "hd": 0.65 * p.z,
			"h": 1.1 * p.z, "kind": "rock", "stand_low": true})
	for p in m["stacks"]:
		out.append({"x": p.x, "z": p.y, "hw": 1.0, "hd": 0.85, "h": 1.9, "kind": "stack"})
	# границы карты
	var half_size: float = float(m["size"]) * 0.5 - 1.0
	out.append({"x": 0.0, "z": -half_size, "hw": float(m["size"]) * 0.5, "hd": 1.1, "h": 7.0, "kind": "edge"})
	out.append({"x": 0.0, "z": half_size, "hw": float(m["size"]) * 0.5, "hd": 1.1, "h": 7.0, "kind": "edge"})
	out.append({"x": -half_size, "z": 0.0, "hw": 1.1, "hd": float(m["size"]) * 0.5, "h": 7.0, "kind": "edge"})
	out.append({"x": half_size, "z": 0.0, "hw": 1.1, "hd": float(m["size"]) * 0.5, "h": 7.0, "kind": "edge"})
	return out


# ---------------------------------------------------------------------------
# 11. ФРАЗЫ «больно думающих» боевиков
# ---------------------------------------------------------------------------
const THOUGHTS := [
	"Кто это там?", "Слышал шорох…", "Считаю углы…", "Он у ящиков?",
	"Надо обойти слева", "Не стреляй в спину, думай", "Позиция плохая",
	"Сейчас перезаряжусь", "Тяжело думать под огнём", "Он сменил укрытие",
	"Держите сектор!", "Тихо. Слушаю.", "Прикройте, я обхожу", "Огонь по нему!",
]

const COMMANDS := ["Обходи слева!", "Прикрой меня!", "Держим угол!", "Он наверху!", "Отходим!"]
