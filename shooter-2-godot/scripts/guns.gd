extends RefCounted
class_name SH2Guns
## СЕКТОР «ПЕПЕЛ» — чертежи оружия: контуры, обведённые точками.
##
## Каждый ствол описан силуэтом сбоку так, как его обводят по референсу:
## точки задаются в метрах (Z — вперёд по стволу, Y — вверх).
## Дальше SH2Outline выдавливает контур с фаской, а стволы, оптика и
## нагнетатели строятся телами вращения.

const V := Vector2

static func pistol() -> Dictionary:
	return {
		"id": "pistol",
		"parts": [
			{"kind": "outline", "color": Color("#2b2f33"), "depth": 0.028, "bevel": 0.004,
				"pts": [V(-0.075, 0.010), V(-0.075, 0.062), V(-0.030, 0.070), V(0.040, 0.066),
					V(0.085, 0.058), V(0.092, 0.040), V(0.088, 0.026), V(0.030, 0.024),
					V(0.010, 0.020), V(-0.030, 0.018), V(-0.060, 0.012)]},
			{"kind": "outline", "color": Color("#1d2124"), "depth": 0.030, "bevel": 0.005,
				"pts": [V(-0.062, 0.012), V(-0.030, 0.010), V(-0.006, -0.052), V(-0.020, -0.100),
					V(-0.052, -0.104), V(-0.072, -0.058)]},
			{"kind": "outline", "color": Color("#3b4248"), "depth": 0.020, "bevel": 0.002,
				"pts": [V(-0.052, 0.024), V(0.020, 0.022), V(0.020, 0.006), V(-0.052, 0.008)]},
			{"kind": "revolve", "color": Color("#3b4248"), "c": Vector3(0, 0.046, 0.085),
				"pts": [V(0.0, 0.011), V(0.02, 0.011), V(0.02, 0.009), V(0.03, 0.009), V(0.03, 0.0)],
				"axis": "z"},
			{"kind": "outline", "color": Color("#22262a"), "depth": 0.008, "bevel": 0.001,
				"pts": [V(-0.010, 0.066), V(0.006, 0.066), V(0.006, 0.052), V(-0.010, 0.052)]},
			{"kind": "outline", "color": Color("#15181b"), "depth": 0.026, "bevel": 0.002,
				"pts": [V(-0.058, 0.018), V(-0.030, 0.018), V(-0.020, -0.030), V(-0.040, -0.034)]},
		],
		"muzzle": Vector3(0, 0.046, 0.112),
		"grip": Vector3(0, -0.02, -0.045),
		"foregrip": Vector3(0, -0.03, 0.02),
		"sight_y": 0.072,
	}


static func smg() -> Dictionary:
	return {
		"id": "smg",
		"parts": [
			{"kind": "outline", "color": Color("#2c3236"), "depth": 0.048, "bevel": 0.006,
				"pts": [V(-0.16, 0.012), V(-0.16, 0.075), V(-0.05, 0.085), V(0.06, 0.083),
					V(0.16, 0.076), V(0.18, 0.055), V(0.18, 0.030), V(0.10, 0.018),
					V(0.02, 0.014), V(-0.06, 0.010)]},
			{"kind": "revolve", "color": Color("#3c444a"), "c": Vector3(0, 0.052, 0.18),
				"pts": [V(0.0, 0.010), V(0.10, 0.010), V(0.10, 0.008), V(0.11, 0.008), V(0.11, 0.0)],
				"axis": "z"},
			{"kind": "revolve", "color": Color("#272c30"), "c": Vector3(0, 0.040, 0.185),
				"pts": [V(0.0, 0.021), V(0.055, 0.019), V(0.06, 0.016), V(0.062, 0.0)],
				"axis": "z", "segments": 10},
			{"kind": "outline", "color": Color("#1e2225"), "depth": 0.034, "bevel": 0.004,
				"pts": [V(0.005, 0.016), V(0.048, 0.016), V(0.058, -0.075), V(0.070, -0.155),
					V(0.030, -0.160), V(0.012, -0.078)]},
			{"kind": "outline", "color": Color("#1a1e21"), "depth": 0.038, "bevel": 0.006,
				"pts": [V(-0.075, 0.014), V(-0.035, 0.010), V(-0.016, -0.060), V(-0.032, -0.098),
					V(-0.066, -0.100), V(-0.086, -0.050)]},
			{"kind": "outline", "color": Color("#33393e"), "depth": 0.030, "bevel": 0.004,
				"pts": [V(-0.160, 0.070), V(-0.235, 0.062), V(-0.245, 0.030), V(-0.238, -0.010),
					V(-0.205, -0.012), V(-0.198, 0.040), V(-0.160, 0.036)]},
			{"kind": "revolve", "color": Color("#22272b"), "c": Vector3(0, 0.058, -0.02),
				"pts": [V(0.0, 0.013), V(0.13, 0.013), V(0.13, 0.0)], "axis": "z"},
			{"kind": "outline", "color": Color("#24282c"), "depth": 0.010, "bevel": 0.001,
				"pts": [V(-0.055, 0.088), V(-0.040, 0.100), V(-0.026, 0.088)]},
			{"kind": "outline", "color": Color("#24282c"), "depth": 0.008, "bevel": 0.001,
				"pts": [V(0.150, 0.078), V(0.160, 0.092), V(0.170, 0.078)]},
			{"kind": "outline", "color": Color("#ffb347"), "depth": 0.012, "bevel": 0.001,
				"pts": [V(-0.020, 0.081), V(0.005, 0.081), V(0.005, 0.070), V(-0.020, 0.070)]},
		],
		"muzzle": Vector3(0, 0.052, 0.30),
		"grip": Vector3(0, -0.03, -0.052),
		"foregrip": Vector3(0, 0.02, 0.13),
		"sight_y": 0.10,
	}


static func rifle() -> Dictionary:
	return {
		"id": "rifle",
		"parts": [
			{"kind": "outline", "color": Color("#2b3034"), "depth": 0.052, "bevel": 0.006,
				"pts": [V(-0.20, 0.020), V(-0.20, 0.086), V(-0.12, 0.098), V(-0.02, 0.096),
					V(0.10, 0.090), V(0.20, 0.082), V(0.22, 0.056), V(0.20, 0.030),
					V(0.10, 0.020), V(0.00, 0.014), V(-0.10, 0.012)]},
			{"kind": "outline", "color": Color("#333a40"), "depth": 0.044, "bevel": 0.005,
				"pts": [V(-0.19, 0.086), V(-0.10, 0.100), V(0.04, 0.098), V(0.14, 0.090),
					V(0.14, 0.082), V(0.02, 0.088), V(-0.10, 0.090), V(-0.19, 0.078)]},
			{"kind": "outline", "color": Color("#4a3b2a"), "depth": 0.056, "bevel": 0.010,
				"pts": [V(0.20, 0.088), V(0.34, 0.082), V(0.40, 0.070), V(0.40, 0.036),
					V(0.34, 0.026), V(0.22, 0.026), V(0.18, 0.046)]},
			{"kind": "outline", "color": Color("#3c3125"), "depth": 0.050, "bevel": 0.004,
				"pts": [V(0.22, 0.056), V(0.38, 0.050), V(0.38, 0.038), V(0.22, 0.040)]},
			{"kind": "revolve", "color": Color("#2f3539"), "c": Vector3(0, 0.078, 0.20),
				"pts": [V(0.0, 0.013), V(0.20, 0.013), V(0.20, 0.0)], "axis": "z"},
			{"kind": "revolve", "color": Color("#3a4147"), "c": Vector3(0, 0.048, 0.40),
				"pts": [V(0.0, 0.012), V(0.19, 0.011), V(0.19, 0.009), V(0.20, 0.0)], "axis": "z"},
			{"kind": "revolve", "color": Color("#24292d"), "c": Vector3(0, 0.048, 0.58),
				"pts": [V(0.0, 0.018), V(0.030, 0.017), V(0.034, 0.012), V(0.036, 0.0)],
				"axis": "z", "segments": 10},
			{"kind": "outline", "color": Color("#2f3539"), "depth": 0.040, "bevel": 0.004,
				"pts": [V(0.30, 0.070), V(0.345, 0.076), V(0.35, 0.030), V(0.30, 0.030)]},
			{"kind": "outline", "color": Color("#6b4a2c"), "depth": 0.040, "bevel": 0.006,
				"pts": [V(0.012, 0.018), V(0.075, 0.018), V(0.098, -0.070), V(0.120, -0.160),
					V(0.098, -0.196), V(0.052, -0.190), V(0.020, -0.090)]},
			{"kind": "outline", "color": Color("#5b3a26"), "depth": 0.042, "bevel": 0.008,
				"pts": [V(-0.105, 0.016), V(-0.058, 0.012), V(-0.036, -0.070), V(-0.056, -0.112),
					V(-0.096, -0.110), V(-0.118, -0.052)]},
			{"kind": "outline", "color": Color("#5b3a26"), "depth": 0.046, "bevel": 0.010,
				"pts": [V(-0.200, 0.086), V(-0.310, 0.072), V(-0.360, 0.050), V(-0.372, -0.010),
					V(-0.340, -0.038), V(-0.300, 0.000), V(-0.290, 0.050), V(-0.205, 0.040)]},
			{"kind": "outline", "color": Color("#2c3236"), "depth": 0.036, "bevel": 0.004,
				"pts": [V(-0.360, 0.048), V(-0.392, 0.046), V(-0.392, -0.022), V(-0.358, -0.030)]},
			{"kind": "outline", "color": Color("#22262a"), "depth": 0.014, "bevel": 0.001,
				"pts": [V(-0.070, 0.098), V(-0.045, 0.116), V(-0.020, 0.098)]},
			{"kind": "outline", "color": Color("#22262a"), "depth": 0.010, "bevel": 0.001,
				"pts": [V(0.520, 0.062), V(0.532, 0.082), V(0.544, 0.062)]},
			{"kind": "outline", "color": Color("#1e2225"), "depth": 0.016, "bevel": 0.002,
				"pts": [V(-0.070, 0.030), V(-0.040, 0.026), V(-0.032, -0.012), V(-0.060, -0.016)]},
			{"kind": "outline", "color": Color("#4a5157"), "depth": 0.028, "bevel": 0.004,
				"pts": [V(-0.040, 0.098), V(-0.006, 0.094), V(0.004, 0.076), V(-0.030, 0.078)]},
			{"kind": "outline", "color": Color("#22262a"), "depth": 0.030, "bevel": 0.003,
				"pts": [V(-0.100, 0.006), V(-0.030, 0.002), V(-0.022, -0.036), V(-0.048, -0.040),
					V(-0.054, -0.014), V(-0.096, -0.010)]},
			{"kind": "outline", "color": Color("#2a2f33"), "depth": 0.014, "bevel": 0.002,
				"pts": [V(-0.330, 0.030), V(-0.300, 0.026), V(-0.296, -0.046), V(-0.324, -0.042)]},
			{"kind": "outline", "color": Color("#4a3423"), "depth": 0.038, "bevel": 0.006,
				"pts": [V(-0.300, 0.078), V(-0.230, 0.090), V(-0.210, 0.100), V(-0.300, 0.092)]},
			{"kind": "outline", "color": Color("#372c20"), "depth": 0.062, "bevel": 0.003,
				"pts": [V(0.24, 0.074), V(0.38, 0.062), V(0.38, 0.052), V(0.24, 0.062)]},
		],
		"muzzle": Vector3(0, 0.048, 0.62),
		"grip": Vector3(0, -0.03, -0.085),
		"foregrip": Vector3(0, 0.02, 0.30),
		"sight_y": 0.09,
	}


static func shotgun() -> Dictionary:
	return {
		"id": "shotgun",
		"parts": [
			{"kind": "outline", "color": Color("#2b3034"), "depth": 0.056, "bevel": 0.007,
				"pts": [V(-0.17, 0.018), V(-0.17, 0.080), V(-0.06, 0.090), V(0.06, 0.088),
					V(0.16, 0.078), V(0.175, 0.052), V(0.165, 0.026), V(0.06, 0.018),
					V(-0.06, 0.012)]},
			{"kind": "revolve", "color": Color("#3a4147"), "c": Vector3(0, 0.072, 0.17),
				"pts": [V(0.0, 0.026), V(0.40, 0.024), V(0.40, 0.020), V(0.42, 0.0)], "axis": "z"},
			{"kind": "revolve", "color": Color("#1b1f22"), "c": Vector3(0, 0.030, 0.17),
				"pts": [V(0.0, 0.020), V(0.31, 0.019), V(0.31, 0.0)], "axis": "z", "segments": 10},
			{"kind": "outline", "color": Color("#5b432c"), "depth": 0.060, "bevel": 0.010,
				"pts": [V(0.14, 0.082), V(0.30, 0.074), V(0.34, 0.052), V(0.33, 0.014),
					V(0.20, 0.010), V(0.14, 0.036)]},
			{"kind": "outline", "color": Color("#5b3a26"), "depth": 0.044, "bevel": 0.008,
				"pts": [V(-0.085, 0.016), V(-0.040, 0.012), V(-0.022, -0.062), V(-0.044, -0.104),
					V(-0.082, -0.100), V(-0.100, -0.048)]},
			{"kind": "outline", "color": Color("#5b3a26"), "depth": 0.048, "bevel": 0.010,
				"pts": [V(-0.170, 0.082), V(-0.290, 0.070), V(-0.340, 0.044), V(-0.352, -0.014),
					V(-0.316, -0.040), V(-0.276, 0.000), V(-0.268, 0.048), V(-0.176, 0.040)]},
			{"kind": "outline", "color": Color("#22262a"), "depth": 0.012, "bevel": 0.001,
				"pts": [V(-0.060, 0.090), V(-0.040, 0.104), V(-0.020, 0.090)]},
			{"kind": "outline", "color": Color("#22262a"), "depth": 0.010, "bevel": 0.001,
				"pts": [V(0.380, 0.086), V(0.392, 0.100), V(0.404, 0.086)]},
			{"kind": "outline", "color": Color("#7d6a4a"), "depth": 0.062, "bevel": 0.004,
				"pts": [V(0.18, 0.034), V(0.32, 0.030), V(0.32, 0.018), V(0.18, 0.020)]},
		],
		"muzzle": Vector3(0, 0.072, 0.60),
		"grip": Vector3(0, -0.03, -0.060),
		"foregrip": Vector3(0, 0.02, 0.26),
		"sight_y": 0.10,
	}


static func dmr() -> Dictionary:
	return {
		"id": "dmr",
		"parts": [
			{"kind": "outline", "color": Color("#2c3236"), "depth": 0.046, "bevel": 0.006,
				"pts": [V(-0.22, 0.022), V(-0.22, 0.088), V(-0.10, 0.100), V(0.02, 0.098),
					V(0.14, 0.090), V(0.22, 0.078), V(0.24, 0.050), V(0.20, 0.026),
					V(0.06, 0.018), V(-0.10, 0.014)]},
			{"kind": "outline", "color": Color("#4a3320"), "depth": 0.052, "bevel": 0.010,
				"pts": [V(0.22, 0.088), V(0.42, 0.078), V(0.46, 0.062), V(0.46, 0.030),
					V(0.40, 0.022), V(0.24, 0.022), V(0.20, 0.044)]},
			{"kind": "revolve", "color": Color("#353c42"), "c": Vector3(0, 0.052, 0.46),
				"pts": [V(0.0, 0.011), V(0.34, 0.010), V(0.34, 0.008), V(0.36, 0.0)], "axis": "z",
				"segments": 12},
			{"kind": "revolve", "color": Color("#24292d"), "c": Vector3(0, 0.052, 0.80),
				"pts": [V(0.0, 0.015), V(0.030, 0.014), V(0.034, 0.0)], "axis": "z", "segments": 10},
			{"kind": "revolve", "color": Color("#2f3539"), "c": Vector3(0, 0.085, 0.26),
				"pts": [V(0.0, 0.012), V(0.22, 0.012), V(0.22, 0.0)], "axis": "z"},
			{"kind": "outline", "color": Color("#5b432c"), "depth": 0.040, "bevel": 0.006,
				"pts": [V(0.02, 0.016), V(0.09, 0.014), V(0.10, -0.060), V(0.09, -0.100),
					V(0.04, -0.104), V(0.02, -0.060)]},
			{"kind": "outline", "color": Color("#4a3320"), "depth": 0.044, "bevel": 0.008,
				"pts": [V(-0.115, 0.018), V(-0.065, 0.014), V(-0.045, -0.070), V(-0.070, -0.106),
					V(-0.108, -0.100), V(-0.132, -0.048)]},
			{"kind": "outline", "color": Color("#4a3320"), "depth": 0.040, "bevel": 0.008,
				"pts": [V(-0.220, 0.086), V(-0.320, 0.080), V(-0.360, 0.060), V(-0.352, -0.006),
					V(-0.318, 0.024), V(-0.300, 0.058), V(-0.222, 0.036)]},
			{"kind": "revolve", "color": Color("#1a1e21"), "c": Vector3(0, 0.134, -0.02),
				"pts": [V(0.0, 0.018), V(0.02, 0.026), V(0.045, 0.026), V(0.055, 0.021),
					V(0.185, 0.021), V(0.195, 0.026), V(0.210, 0.024), V(0.220, 0.0)],
				"axis": "z", "segments": 16},
			{"kind": "revolve", "color": Color("#2f3539"), "c": Vector3(0, 0.134, 0.20),
				"pts": [V(0.0, 0.024), V(0.010, 0.024), V(0.012, 0.021), V(0.014, 0.0)],
				"axis": "z", "segments": 14},
			{"kind": "outline", "color": Color("#23282c"), "depth": 0.030, "bevel": 0.002,
				"pts": [V(-0.010, 0.108), V(0.018, 0.108), V(0.018, 0.092), V(-0.010, 0.092)]},
			{"kind": "outline", "color": Color("#23282c"), "depth": 0.030, "bevel": 0.002,
				"pts": [V(0.120, 0.108), V(0.148, 0.108), V(0.148, 0.092), V(0.120, 0.092)]},
			{"kind": "outline", "color": Color("#22262a"), "depth": 0.012, "bevel": 0.001,
				"pts": [V(-0.080, 0.104), V(-0.060, 0.118), V(-0.040, 0.104)]},
		],
		"muzzle": Vector3(0, 0.052, 0.84),
		"grip": Vector3(0, -0.02, -0.095),
		"foregrip": Vector3(0, 0.02, 0.34),
		"sight_y": 0.15,
	}


static func guns() -> Dictionary:
	return {"pistol": pistol(), "smg": smg(), "rifle": rifle(), "shotgun": shotgun(), "dmr": dmr()}


static func blueprint(id: String) -> Dictionary:
	var g := guns()
	return g.get(id, g["rifle"])


## Сборка оружия из чертежа: контуры выдавливаются, тела вращения крутятся
static var _smooth: bool = false


static func build(id: String, opts: Dictionary = {}) -> Node3D:
	_smooth = bool(opts.get("smooth", false))
	var bp := blueprint(id)
	var root := Node3D.new()
	root.name = "weapon_" + id
	for part in bp["parts"]:
		var geom: Node3D = null
		if part["kind"] == "outline":
			var mesh := SH2Outline.outline_mesh(part["pts"], {
				"depth": part["depth"], "bevel": part["bevel"]})
			geom = SH2Outline.mesh_node(mesh, part["color"], {"roughness": 0.62})
		else:
			var pts: Array = []
			for p in part["pts"]:
				pts.append([p.x, p.y])
			var mesh2 := SH2Outline.revolve(pts, {"segments": int(part.get("segments", 14))})
			geom = SH2Outline.mesh_node(mesh2, part["color"], {"roughness": 0.55})
			# Lathe в Godot — вдоль Y; поворачиваем под нужную ось
			if part.get("axis", "z") == "z":
				geom.rotation = Vector3(-PI * 0.5, 0, 0)
			elif part.get("axis", "z") == "x":
				geom.rotation = Vector3(0, 0, PI * 0.5)
			geom.position = part.get("c", Vector3.ZERO)
		root.add_child(geom)
	# точки крепления
	var muzzle := Marker3D.new()
	muzzle.name = "muzzle"
	muzzle.position = bp["muzzle"]
	root.add_child(muzzle)
	var grip := Marker3D.new()
	grip.name = "grip"
	grip.position = bp["grip"]
	root.add_child(grip)
	var fore := Marker3D.new()
	fore.name = "foregrip"
	fore.position = bp["foregrip"]
	root.add_child(fore)
	if _smooth:
		root.set_meta("smooth", true)
	root.set_meta("sight_y", bp["sight_y"])
	root.set_meta("blueprint_id", id)
	return root
