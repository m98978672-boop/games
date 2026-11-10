shader_type canvas_item;
// Смена времени суток, туман и осадки в пиксельном стиле (ступенчатые полосы дождя/снега).

uniform float darkness : hint_range(0.0, 0.9) = 0.0;
uniform float rain_intensity : hint_range(0.0, 1.0) = 0.0;
uniform float snow_intensity : hint_range(0.0, 1.0) = 0.0;
uniform float fog_intensity : hint_range(0.0, 1.0) = 0.0;
uniform vec4 night_tint : source_color = vec4(0.059, 0.161, 0.208, 1.0);
uniform vec2 pixel_res = vec2(480.0, 270.0);

float hash21(vec2 p) {
	p = fract(p * vec2(123.34, 456.21));
	p += dot(p, p + 45.32);
	return fract(p.x * p.y);
}

void fragment() {
	vec2 px = floor(UV * pixel_res);
	vec4 base = vec4(night_tint.rgb, darkness * 0.78);

	// Полосы дождя в пиксельной сетке
	if (rain_intensity > 0.01) {
		float col = px.x;
		float speed = floor(TIME * 22.0);
		float streak = step(0.96 - rain_intensity * 0.06, hash21(vec2(col, floor((px.y - speed * 3.0) * 0.12))));
		base = mix(base, vec4(0.588, 0.647, 0.737, 0.65), streak * rain_intensity);
	}

	// Снежинки
	if (snow_intensity > 0.01) {
		float fall = floor(TIME * 8.0);
		float flake = step(0.985 - snow_intensity * 0.025, hash21(vec2(px.x + floor(sin(fall * 0.3) * 2.0), px.y - fall)));
		base = mix(base, vec4(0.718, 0.753, 0.780, 0.85), flake * snow_intensity);
	}

	// Дымка / туман
	base = mix(base, vec4(0.549, 0.573, 0.620, 0.48), fog_intensity * 0.55);
	COLOR = base;
}
