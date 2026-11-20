class_name RazlomBallistics
extends RefCounted
## Shared, deliberately explicit gameplay zones; not an organ simulation.
static func region(local: Vector3, crouched: bool = false) -> String:
	var point := local / (0.72 if crouched else 1.0)
	if point.y >= 1.48:
		return "head"
	if point.y < 0.72:
		return "legs"
	if absf(point.x) > 0.23:
		return "arms"
	if point.y >= 1.08 and point.y <= 1.44 and absf(point.x) < 0.18:
		return "vitals"
	return "torso"

static func resolve(region_name: String, power: float, protection: float) -> Dictionary:
	if not is_finite(power) or power <= 0:
		return {"damage": 0.0, "wear": 0.0, "fatal": false}
	var protected_zone := region_name in ["head", "vitals", "torso"]
	var blocked := protected_zone and protection >= power
	var fatal := region_name in ["head", "vitals"] and power >= 30.0 and not blocked
	var multiplier := 0.55 if region_name == "arms" else (0.75 if region_name == "legs" else 1.0)
	return {"damage": 100.0 if fatal else power * multiplier * (0.2 if blocked else 1.0), "wear": minf(protection, power) if protected_zone else 0.0, "fatal": fatal}
