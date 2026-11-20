class_name RazlomCombatFeedback
extends Control
## Readable, short combat cues. Never changes hit detection or health.
var hit_time := 0.0
var hurt_time := 0.0
func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	process_mode = Node.PROCESS_MODE_PAUSABLE
func _process(delta: float) -> void:
	hit_time = maxf(0.0, hit_time - delta)
	hurt_time = maxf(0.0, hurt_time - delta)
	queue_redraw()
func _draw() -> void:
	var center := size * 0.5
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
