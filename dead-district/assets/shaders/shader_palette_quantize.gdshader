shader_type canvas_item;
// Квантование изображения SubViewport (480x270) в единую 32-цветную палитру Survival Horror 32
// с опциональным упорядоченным дизерингом 4x4 Байера без антиалиасинга.

uniform sampler2D palette_lut : filter_nearest;
uniform sampler2D bayer_tex : filter_nearest, repeat_enable;
uniform vec2 viewport_size = vec2(480.0, 270.0);
uniform float dither_strength : hint_range(0.0, 0.25) = 0.05;
uniform int palette_count = 32;

void fragment() {
	vec2 snapped_uv = (floor(UV * viewport_size) + 0.5) / viewport_size;
	vec4 src = texture(TEXTURE, snapped_uv);
	float bayer = texture(bayer_tex, (UV * viewport_size) / 4.0).r - 0.5;
	vec3 target = clamp(src.rgb + vec3(bayer * dither_strength), 0.0, 1.0);

	float best_dist = 999.0;
	vec3 best_col = target;
	for (int i = 0; i < 32; i++) {
		if (i >= palette_count) {
			break;
		}
		float u = (float(i) + 0.5) / float(palette_count);
		vec3 p = texture(palette_lut, vec2(u, 0.5)).rgb;
		vec3 diff = target - p;
		float d = dot(diff, diff);
		if (d < best_dist) {
			best_dist = d;
			best_col = p;
		}
	}
	COLOR = vec4(best_col, src.a);
}
