class_name RazlomAIMemory
extends RefCounted
## Bounded episodic memory: observations only, never a live target reference.
const CAPACITY := 12
const RETENTION := 180.0
const SOURCES := ["sight", "sound", "radio", "damage"]
var events: Array[Dictionary] = []

func observe(point: Vector3, source: String, confidence: float) -> void:
	if source not in SOURCES or not point.is_finite():
		return
	# Repeated scans refresh one episode rather than allocating every frame.
	for event in events:
		if event.source == source and event.point.distance_to(point) < 2.0 and not event.cleared:
			event.point = point
			event.age = 0.0
			event.confidence = clampf(confidence, 0, 1)
			return
	events.append({"point": point, "source": source, "confidence": clampf(confidence, 0, 1), "age": 0.0, "cleared": false})
	if events.size() > CAPACITY:
		events.pop_front()

func tick(delta: float) -> void:
	for event in events:
		event.age += maxf(0, delta)
	for i in range(events.size() - 1, -1, -1):
		if events[i].age >= RETENTION:
			events.remove_at(i)

func focus() -> Dictionary:
	var best: Dictionary = {}
	var best_score := 0.1
	for event in events:
		if event.cleared:
			continue
		var lifetime := 30.0 if event.source == "sight" else 18.0
		var score: float = event.confidence * maxf(0, 1.0 - event.age / lifetime)
		if score > best_score:
			best = event
			best_score = score
	return best

func snapshot() -> Array:
	var result: Array = []
	for event in events:
		result.append({"position": [event.point.x, event.point.y, event.point.z], "source": event.source,
			"confidence": event.confidence, "age": event.age, "cleared": event.cleared})
	return result

static func valid(data: Variant) -> bool:
	if not data is Array or data.size() > CAPACITY:
		return false
	for event in data:
		if not event is Dictionary or event.get("source") not in SOURCES or not event.get("cleared") is bool:
			return false
		for field in ["age", "confidence"]:
			var value = event.get(field)
			if not (value is float or value is int) or not is_finite(float(value)):
				return false
		if event.age < 0 or event.age > RETENTION or event.confidence < 0 or event.confidence > 1:
			return false
		var point = event.get("position")
		if not point is Array or point.size() != 3:
			return false
		for value in point:
			if not (value is float or value is int) or not is_finite(float(value)) or absf(float(value)) > 128:
				return false
	return true

func restore(data: Array) -> bool:
	if not valid(data):
		return false
	var restored: Array[Dictionary] = []
	for event in data:
		restored.append({"point": Vector3(event.position[0], event.position[1], event.position[2]),
			"source": event.source, "confidence": float(event.confidence), "age": float(event.age), "cleared": event.cleared})
	events = restored
	return true
