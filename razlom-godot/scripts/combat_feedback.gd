class_name RazlomCombatFeedback
extends Control
## Readable, short combat cues. Never changes hit detection or health.
var hit_time := 0.0
var hurt_time := 0.0
var injury_text := ""
var injury_direction := Vector2.UP
var pain := 0.0
var injury_time := 0.0

func injury(zone: String, source: Vector3, intensity: float, fatal: bool) -> void:
	var names := {"head": "ГОЛОВА", "vitals": "ГРУДЬ", "torso": "КОРПУС", "arms": "РУКА", "legs": "НОГА"}
	injury_text = ("СМЕРТЕЛЬНОЕ РАНЕНИЕ • " if fatal else "РАНЕНИЕ • ") + str(names.get(zone, zone))
	injury_direction = Vector2(source.x, source.z).normalized()
	pain = intensity
	injury_time = 4.0
	hurt_time = 0.8
func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	process_mode = Node.PROCESS_MODE_PAUSABLE
func _process(delta: float) -> void:
	injury_time = maxf(0, injury_time - delta)
	pain = maxf(0, pain - delta * 4)
	hit_time = maxf(0.0, hit_time - delta)
	hurt_time = maxf(0.0, hurt_time - delta)
	queue_redraw()
func _draw() -> void:
	var center := size * 0.5
	if pain > 1:
		var pulse := 0.5 + sin(Time.get_ticks_msec() * 0.008) * 0.5
		draw_rect(Rect2(Vector2.ZERO, size), Color(0.35, 0.015, 0.01, pain * 0.0007 * pulse))
	if injury_time > 0:
		var font := ThemeDB.fallback_font
		draw_string(font, Vector2(24, size.y * 0.72), injury_text, HORIZONTAL_ALIGNMENT_LEFT, -1, 18, Color("ffc5a0"))
		var tip := center + injury_direction * 72
		draw_line(tip, tip - injury_direction.rotated(0.45) * 16, Color("f06d46"), 4, true)
		draw_line(tip, tip - injury_direction.rotated(-0.45) * 16, Color("f06d46"), 4, true)
	if hit_time > 0:
		var color := Color(0.95, 0.83, 0.55, minf(1.0, hit_time / 0.08))
		for side in [Vector2(-1, -1), Vector2(1, -1), Vector2(-1, 1), Vector2(1, 1)]:
			draw_line(center + side * 8, center + side * 15, color, 2.0, true)
	if hurt_time > 0:
		var alpha := minf(0.22, hurt_time * 0.65)
		var color := Color(0.55, 0.1, 0.06, alpha)
		var width := minf(size.x, size.y) * 0.035
		draw_rect(Rect2(0, 0, width, size.y), color)
		draw_rect(Rect2(size.x - width, 0, width, size.y), color)
		draw_rect(Rect2(0, 0, size.x, width), color)
		draw_rect(Rect2(0, size.y - width, size.x, width), color)
