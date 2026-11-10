shader_type canvas_item;
// Пиксельная рябь воды для луж и бочек (дискретизирована до целых текселей).

uniform vec2 tex_size = vec2(32.0, 32.0);

void fragment() {
	vec2 p = floor(UV * tex_size);
	float wave = floor(sin(p.y * 0.8 + TIME * 4.0) * 1.2);
	vec2 uv_rippled = (p + vec2(wave, 0.0) + 0.5) / tex_size;
	vec4 col = texture(TEXTURE, uv_rippled);
	float glint = step(0.95, sin(p.x * 0.9 - p.y * 0.7 + TIME * 3.0));
	col.rgb = mix(col.rgb, vec3(0.588, 0.647, 0.737), glint * 0.4 * col.a);
	COLOR = col;
}
