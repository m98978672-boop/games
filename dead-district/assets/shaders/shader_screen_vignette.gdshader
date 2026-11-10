shader_type canvas_item;
// Экранная ступенчатая виньетка (паника, кровопотеря, переохлаждение) в палитре проекта.

uniform float blood_level : hint_range(0.0, 1.0) = 0.0;
uniform float cold_level : hint_range(0.0, 1.0) = 0.0;
uniform float panic_level : hint_range(0.0, 1.0) = 0.0;

void fragment() {
	vec2 d = abs(UV - vec2(0.5)) * 2.0;
	float edge = max(d.x, d.y);
	float rings = floor(clamp(edge * 6.0, 0.0, 6.0)) / 6.0;
	float pulse = 0.85 + 0.15 * sin(TIME * 5.0);

	vec4 out_col = vec4(0.0);
	if (blood_level > 0.05) {
		out_col = mix(out_col, vec4(0.443, 0.208, 0.247, 0.55), rings * blood_level * pulse);
	}
	if (cold_level > 0.05) {
		out_col = mix(out_col, vec4(0.318, 0.290, 0.471, 0.45), rings * cold_level);
	}
	if (panic_level > 0.05) {
		out_col = mix(out_col, vec4(0.059, 0.161, 0.208, 0.5), rings * panic_level * pulse);
	}
	COLOR = out_col;
}
