shader_type canvas_item;
// Однопиксельная тёмная обводка для 2D пиксель-арт спрайтов без сглаживания.

uniform vec4 outline_color : source_color = vec4(0.0, 0.0, 0.0, 1.0);
uniform float alpha_threshold : hint_range(0.0, 1.0) = 0.5;

void fragment() {
	vec2 px = TEXTURE_PIXEL_SIZE;
	vec4 center = texture(TEXTURE, UV);
	if (center.a >= alpha_threshold) {
		COLOR = center;
	} else {
		float a = 0.0;
		a = max(a, texture(TEXTURE, UV + vec2(px.x, 0.0)).a);
		a = max(a, texture(TEXTURE, UV - vec2(px.x, 0.0)).a);
		a = max(a, texture(TEXTURE, UV + vec2(0.0, px.y)).a);
		a = max(a, texture(TEXTURE, UV - vec2(0.0, px.y)).a);
		if (a >= alpha_threshold) {
			COLOR = outline_color;
		} else {
			COLOR = vec4(0.0);
		}
	}
}
