shader_type canvas_item;
// Туман войны (Fog of War) на основе карты видимости shadowcasting FOV:
// 0.0 = не исследовано (полная тьма), 0.5 = исследовано вне обзора, 1.0 = видно сейчас.

uniform sampler2D fov_mask : filter_nearest;
uniform vec4 shroud_color : source_color = vec4(0.059, 0.161, 0.208, 0.92);
uniform vec4 memory_color : source_color = vec4(0.059, 0.161, 0.208, 0.55);

void fragment() {
	float vis = texture(fov_mask, UV).r;
	if (vis > 0.8) {
		COLOR = vec4(0.0);
	} else if (vis > 0.3) {
		COLOR = memory_color;
	} else {
		COLOR = shroud_color;
	}
}
