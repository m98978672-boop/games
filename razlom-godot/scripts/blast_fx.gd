class_name RazlomBlastFX
extends Node3D
## Bounded, transient visual blast. Damage remains in game.explode().
var age := 0.0
var smoke: Array[MeshInstance3D] = []
var fire: MeshInstance3D
var ring: MeshInstance3D
var light: OmniLight3D
static var sphere: SphereMesh
static var torus: TorusMesh
static var smoke_quad: QuadMesh
func _ready() -> void:
	add_to_group("blast_fx")
	var effects := get_tree().get_nodes_in_group("blast_fx").filter(func(effect): return not effect.is_queued_for_deletion())
	if effects.size() > 8:
		effects[0].queue_free()
	if sphere == null:
		sphere = SphereMesh.new()
		sphere.radial_segments = 12
		sphere.rings = 6
		smoke_quad = QuadMesh.new()
		smoke_quad.size = Vector2.ONE * 2
		torus = TorusMesh.new()
		torus.inner_radius = 0.92
		torus.outer_radius = 1.0
		torus.rings = 24
		torus.ring_segments = 6
	fire = orb(Color("ffbd62"), true)
	fire.scale = Vector3.ONE * 0.2
	ring = MeshInstance3D.new()
	ring.mesh = torus
	ring.position.y = 0.05
	ring.material_override = make_material(Color("c7a275"), false)
	add_child(ring)
	for i in range(6):
		var puff := MeshInstance3D.new()
		puff.mesh = smoke_quad
		var mat := make_material(Color("645e52"), false)
		mat.albedo_texture = preload("res://assets/effects/smoke.png")
		mat.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
		mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		mat.cull_mode = BaseMaterial3D.CULL_DISABLED
		puff.material_override = mat
		add_child(puff)
		puff.position = Vector3(cos(i * 2.4), 0.2, sin(i * 2.4)) * 0.55
		smoke.append(puff)
	light = OmniLight3D.new()
	light.light_color = Color("ffba73")
	light.omni_range = 10
	light.light_energy = 5
	add_child(light)
func make_material(color: Color, emissive: bool) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 1
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.emission_enabled = emissive
	mat.emission = color
	return mat
func orb(color: Color, emissive: bool) -> MeshInstance3D:
	var visual := MeshInstance3D.new()
	visual.mesh = sphere
	visual.material_override = make_material(color, emissive)
	add_child(visual)
	return visual
func _process(delta: float) -> void:
	age += delta
	fire.scale = Vector3.ONE * (0.3 + minf(age * 16, 3.5))
	fire.visible = age < 0.25
	light.light_energy = maxf(0, 5 - age * 20)
	ring.scale = Vector3.ONE * (0.2 + age * 8)
	ring.visible = age < 0.7
	(ring.material_override as StandardMaterial3D).albedo_color.a = maxf(0, 1 - age / 0.7)
	for i in range(smoke.size()):
		var puff := smoke[i]
		puff.position += Vector3(cos(i * 2.4) * 0.2, 0.7 + i * 0.07, sin(i * 2.4) * 0.2) * delta
		puff.scale = Vector3.ONE * (0.5 + age * 0.9)
		(puff.material_override as StandardMaterial3D).albedo_color.a = clampf(1 - age / 2.6, 0, 0.75)
	if age > 2.6:
		queue_free()
