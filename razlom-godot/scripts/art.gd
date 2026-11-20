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
		mat.normal_enabled = true
		mat.normal_texture = load("res://assets/textures/surface/" + texture + "_normal.png")
		mat.normal_scale = 0.45
		mat.roughness_texture = load("res://assets/textures/surface/" + texture + "_roughness.png")
		mat.roughness_texture_channel = BaseMaterial3D.TEXTURE_CHANNEL_RED
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
	dress_actor(root)
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

static func dress_actor(root: Node3D, medic: bool = false) -> void:
	if root.has_meta("detailed"):
		return
	root.set_meta("detailed", true)
	var head := root.get_node_or_null("Head") as Node3D
	if head != null:
		var eye_mat := material(Color("253632"))
		for side in [-1, 1]:
			var eye := box(head, Vector3(side * 0.085, 0.015, -0.178), Vector3(0.065, 0.035, 0.018), material(Color("e5ded0")))
			eye.name = "EyeL" if side < 0 else "EyeR"
			box(eye, Vector3(0, 0, -0.012), Vector3(0.026, 0.027, 0.012), eye_mat)
			box(head, Vector3(side * 0.085, 0.065, -0.18), Vector3(0.07, 0.012 if medic else 0.018, 0.018), material(Color("574533")))
			box(head, Vector3(side * 0.18, -0.005, 0), Vector3(0.035, 0.075, 0.07), material(Color("b99978")))
		box(head, Vector3(0, -0.025, -0.19), Vector3(0.045, 0.065, 0.045), material(Color("b99978")))
		box(head, Vector3(0, -0.09, -0.18), Vector3(0.095, 0.018, 0.018), material(Color("795447")))
		var scalp := box(head, Vector3(0, 0.14, 0.015), Vector3(0.35, 0.065, 0.34), material(Color("544435")))
		if medic:
			scalp.name = "VeraHairline"
			# Distinct tied-back hairstyle, carried by the animated head.
			var old_hair := root.get_node_or_null("Hair") as Node3D
			if old_hair != null:
				old_hair.reparent(head, true)
				old_hair.position = Vector3(0, 0.15, 0.04)
			for side in [-1, 1]:
				box(head, Vector3(side * 0.153, 0.055, 0.055), Vector3(0.045, 0.21, 0.24), material(Color("594337")))
			for i in range(5):
				var braid := box(head, Vector3(0.105 + sin(i * 2.0) * 0.014, -0.04 - i * 0.055, 0.19), Vector3(0.075, 0.075, 0.075), material(Color("594337")))
				braid.name = "Braid%d" % i
			box(head, Vector3(0.105, -0.29, 0.19), Vector3(0.08, 0.025, 0.08), material(Color("b6c8b8")))
	var fabric := material(Color("e0e7d5") if medic else Color("768575"), "cloth")
	for side in [-1, 1]:
		box(root, Vector3(side * 0.15, 1.1, -0.17), Vector3(0.16, 0.17, 0.065), fabric)
		box(root, Vector3(side * 0.19, 1.25, -0.17), Vector3(0.035, 0.39, 0.035), material(Color("473f33"), "wood"))
	box(root, Vector3(0, 0.86, 0), Vector3(0.58, 0.055, 0.33), material(Color("454337")))
	box(root, Vector3(0, 1.13, 0.22), Vector3(0.38, 0.45, 0.18), fabric)
	if medic:
		box(root, Vector3(-0.15, 1.13, -0.21), Vector3(0.09, 0.035, 0.01), material(Color("e8e2c8")))
		box(root, Vector3(-0.15, 1.13, -0.22), Vector3(0.03, 0.1, 0.01), material(Color("e8e2c8")))
