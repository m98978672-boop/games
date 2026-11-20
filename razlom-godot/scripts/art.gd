class_name RazlomArt
extends RefCounted
## Original modular art. Shared meshes/materials; no per-frame asset construction.
static var materials: Dictionary = {}
static var meshes: Dictionary = {}

static func material(color: Color, texture: String = "", glow: float = 0.0) -> StandardMaterial3D:
	var key := str(color) + texture + str(glow)
	if materials.has(key):
		return materials[key]
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 0.88
	if not texture.is_empty():
		mat.albedo_texture = load("res://assets/textures/" + texture + ".png")
		mat.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS_ANISOTROPIC
		mat.uv1_triplanar = true
		mat.uv1_scale = Vector3.ONE * 0.65
	if glow > 0:
		mat.emission_enabled = true
		mat.emission = color
		mat.emission_energy_multiplier = glow
	materials[key] = mat
	return mat

static func box(parent: Node3D, pos: Vector3, size: Vector3, mat: Material, solid: bool = false) -> Node3D:
	var root: Node3D = StaticBody3D.new() if solid else Node3D.new()
	parent.add_child(root)
	root.position = pos
	var visual := MeshInstance3D.new()
	var key := str(size)
	if not meshes.has(key):
		var mesh := BoxMesh.new()
		mesh.size = size
		meshes[key] = mesh
	visual.mesh = meshes[key]
	visual.material_override = mat
	visual.visibility_range_end = 125.0
	root.add_child(visual)
	if solid:
		var collision := CollisionShape3D.new()
		var shape := BoxShape3D.new()
		shape.size = size
		collision.shape = shape
		root.add_child(collision)
	return root

static func sign_text(parent: Node3D, text: String, pos: Vector3, font_size: int = 48, color: Color = Color("e6d8ad")) -> Label3D:
	var label := Label3D.new()
	parent.add_child(label)
	label.position = pos
	label.text = text
	label.font_size = font_size
	label.pixel_size = 0.009
	label.modulate = color
	label.outline_size = 3
	label.no_depth_test = false
	label.visibility_range_end = 38.0
	label.visibility_range_end_margin = 8.0
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	return label

static func humanoid(parent: Node3D) -> Node3D:
	var scene: PackedScene = load("res://assets/models/guard.tscn")
	var root: Node3D = scene.instantiate()
	parent.add_child(root)
	return root

static func tree(parent: Node3D, pos: Vector3, height: float) -> void:
	box(parent, pos + Vector3(0, height * 0.4, 0), Vector3(0.4, height * 0.8, 0.4), material(Color.WHITE, "wood"))
	for i in range(3):
		var width := 3.2 - i * 0.65
		box(parent, pos + Vector3(0, height * 0.55 + i * 1.05, 0), Vector3(width, 1.6, width), material(Color("304d41").lightened(i * 0.035)))

static func truck(parent: Node3D, pos: Vector3) -> void:
	var scene: PackedScene = load("res://assets/models/truck.tscn")
	var root: Node3D = scene.instantiate()
	parent.add_child(root)
	root.position = pos
