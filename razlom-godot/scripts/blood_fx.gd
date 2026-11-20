class_name RazlomBloodFX
extends Node3D
## Stylized blood only: no dismemberment, organs or anatomical simulation.
var age := 0.0
var velocities: Array[Vector3] = []
var drops: Array[MeshInstance3D] = []
var direction := Vector3.UP
static var mesh: SphereMesh
static func spawn(game: Node3D, point: Vector3, normal: Vector3) -> void:
	var effect := RazlomBloodFX.new()
	effect.direction = normal.normalized()
	game.world.add_child(effect)
	effect.global_position = point
	var query := PhysicsRayQueryParameters3D.create(point + Vector3.UP * 0.1, point + Vector3.DOWN * 3, 1)
	var hit := game.get_world_3d().direct_space_state.intersect_ray(query)
	if not hit.is_empty(): pool(game.world, hit.position)
static func pool(host: Node3D, point: Vector3) -> Node3D:
	var stain := MeshInstance3D.new()
	stain.add_to_group("blood_stain")
	var quad := QuadMesh.new()
	quad.size = Vector2(0.42, 0.3)
	stain.mesh = quad
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.31, 0.025, 0.018, 0.85)
	mat.albedo_texture = preload("res://assets/effects/smoke.png")
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.roughness = 0.9
	stain.material_override = mat
	host.add_child(stain)
	stain.global_position = point + Vector3.UP * 0.012
	stain.rotation.x = -PI * 0.5
	var stains := host.get_tree().get_nodes_in_group("blood_stain").filter(func(n): return not n.is_queued_for_deletion())
	if stains.size() > 48: stains[0].queue_free()
	return stain
func _ready() -> void:
	add_to_group("blood_fx")
	var effects := get_tree().get_nodes_in_group("blood_fx").filter(func(n): return not n.is_queued_for_deletion())
	if effects.size() > 16: effects[0].queue_free()
	if mesh == null:
		mesh = SphereMesh.new()
		mesh.radius = 0.015
		mesh.height = 0.03
		mesh.radial_segments = 6
		mesh.rings = 4
	for i in range(8):
		var drop := MeshInstance3D.new()
		drop.mesh = mesh
		drop.material_override = RazlomArt.material(Color("8b211b"))
		add_child(drop)
		drops.append(drop)
		velocities.append(direction * (0.8 + i * 0.1) + Vector3(sin(i * 2.4), 0.6 + i * 0.04, cos(i * 2.4)) * 0.7)
func _process(delta: float) -> void:
	age += delta
	for i in range(drops.size()):
		velocities[i].y -= delta * 8
		drops[i].position += velocities[i] * delta
		drops[i].scale = Vector3.ONE * maxf(0.1, 1 - age)
	if age > 0.65: queue_free()
