class_name RazlomArt
extends RefCounted
## Original modular art. Shared meshes/materials; no per-frame asset construction.
static var materials: Dictionary = {}
static var meshes: Dictionary = {}
static var sphere_mesh: SphereMesh

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

static func orb(parent: Node3D, pos: Vector3, scale: Vector3, mat: Material, name: String = "Detail") -> MeshInstance3D:
	if sphere_mesh == null:
		sphere_mesh = SphereMesh.new()
		sphere_mesh.radial_segments = 16
		sphere_mesh.rings = 8
	var visual := MeshInstance3D.new()
	visual.name = name
	visual.mesh = sphere_mesh
	visual.material_override = mat
	visual.position = pos
	visual.scale = scale
	parent.add_child(visual)
	return visual

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
		var skin_color := Color("d3ad8e") if medic else Color("c9a786")
		var skin := material(skin_color)
		var head_visual := head.get_node_or_null("Visual") as MeshInstance3D
		if head_visual != null:
			var head_mesh := SphereMesh.new()
			head_mesh.radius = 0.5
			head_mesh.height = 1.0
			head_mesh.radial_segments = 24
			head_mesh.rings = 16
			head_visual.mesh = head_mesh
			head_visual.scale = Vector3(0.3, 0.35, 0.31)
			head_visual.material_override = skin
		# One continuous head silhouette; small inset eyes, brow, nose and mouth
		# provide human cues without separate oversized oval pieces.
		for side in [-1, 1]:
			var ear := orb(head, Vector3(side * 0.145, -0.015, -0.005), Vector3(0.018, 0.032, 0.014), skin, "EarL" if side < 0 else "EarR")
			ear.rotation.z = side * -0.12
			var eye := Node3D.new()
			eye.name = "EyeL" if side < 0 else "EyeR"
			eye.position = Vector3(side * 0.069, 0.035, -0.3)
			head.add_child(eye)
			box(eye, Vector3.ZERO, Vector3(0.037, 0.017, 0.006), material(Color("eee2d2")))
			orb(eye, Vector3(0, 0, -0.004), Vector3(0.007, 0.009, 0.003), material(Color("626c53")), "Iris")
			orb(eye, Vector3(0, 0, -0.006), Vector3(0.0035, 0.005, 0.002), material(Color("282923")), "Pupil")
			orb(eye, Vector3(-0.002, 0.003, -0.008), Vector3(0.0017, 0.0017, 0.001), material(Color("fff0d9")), "Catchlight")
			var brow := box(head, Vector3(side * 0.07, 0.063, -0.298), Vector3(0.047, 0.009, 0.008), material(Color("594337")))
			brow.rotation.z = side * -0.08
			if medic:
				box(head, Vector3(side * 0.103, -0.026, -0.275), Vector3(0.025, 0.008, 0.003), material(Color("bf887a")))
		# A softly shaded bridge and a small rounded tip sit on the face plane.
		box(head, Vector3(0, -0.006, -0.302), Vector3(0.018, 0.042, 0.014), skin)
		orb(head, Vector3(0, -0.03, -0.313), Vector3(0.012, 0.01, 0.009), material(skin_color.lightened(0.035)), "NoseTip")
		box(head, Vector3(0, -0.078, -0.296), Vector3(0.046, 0.006, 0.005), material(Color("9a6259") if medic else Color("765449")))
		box(head, Vector3(0, -0.083, -0.295), Vector3(0.025, 0.003, 0.004), material(Color("d0a092")))
		var cap := root.get_node_or_null("Cap") as Node3D
		if cap != null: cap.reparent(head, true)
		var hair_mat := material(Color("544435"))
		var scalp := orb(head, Vector3(0, 0.135, 0.012), Vector3(0.16, 0.09, 0.16), hair_mat, "VeraHairline" if medic else "HairCap")
		if medic:
			var old_hair := root.get_node_or_null("Hair") as Node3D
			if old_hair != null:
				old_hair.reparent(head, true)
				old_hair.position = Vector3(0, 0.12, 0.055)
			for side in [-1, 1]:
				var lock := orb(head, Vector3(side * 0.13, 0.015, -0.16), Vector3(0.035, 0.13, 0.1), material(Color("594337")), "TempleLock")
				lock.rotation.z = side * -0.12
			for i in range(3):
				var fringe := box(head, Vector3(-0.075 + i * 0.075, 0.115 - absf(i - 1) * 0.012, -0.29), Vector3(0.07, 0.055, 0.028), material(Color("694c3d")))
				fringe.rotation.z = (i - 1) * 0.14
			for i in range(5):
				var braid := orb(head, Vector3(0.105 + sin(i * 2.0) * 0.014, -0.06 - i * 0.045, 0.16), Vector3(0.036, 0.038, 0.04), material(Color("594337")), "Braid%d" % i)
			box(head, Vector3(0.105, -0.29, 0.16), Vector3(0.06, 0.018, 0.06), material(Color("b6c8b8")))
	var torso := root.get_node("Coat") as Node3D
	var fabric := material(Color("e0e7d5") if medic else Color("768575"), "cloth")
	for side in [-1, 1]:
		box(root, Vector3(side * 0.15, 1.1, -0.17), Vector3(0.16, 0.17, 0.065), fabric).reparent(torso, true)
		box(root, Vector3(side * 0.19, 1.25, -0.17), Vector3(0.035, 0.39, 0.035), material(Color("473f33"), "wood")).reparent(torso, true)
	box(root, Vector3(0, 0.86, 0), Vector3(0.58, 0.055, 0.33), material(Color("454337"))).reparent(torso, true)
	box(root, Vector3(0, 1.13, 0.22), Vector3(0.38, 0.45, 0.18), fabric).reparent(torso, true)
	if medic:
		var linen := material(Color("e8e2c8"))
		box(root, Vector3(-0.15, 1.13, -0.21), Vector3(0.09, 0.035, 0.01), linen).reparent(torso, true)
		box(root, Vector3(-0.15, 1.13, -0.22), Vector3(0.03, 0.1, 0.01), linen).reparent(torso, true)
		# Field-medic jacket tailoring, scarf, visible stitching, buttons and insignia.
		var teal := material(Color("627c73"), "cloth")
		var rust_red := material(Color("ad6558"))
		box(root, Vector3(0, 1.34, -0.01), Vector3(0.24, 0.09, 0.28), teal).reparent(torso, true)
		for y in [1.04, 1.15, 1.26]:
			orb(root, Vector3(0.015, y, -0.161), Vector3(0.018, 0.018, 0.012), material(Color("b69c6e")), "CoatButton").reparent(torso, true)
		box(root, Vector3(0.225, 1.31, -0.01), Vector3(0.012, 0.14, 0.13), linen).reparent(torso, true)
		box(root, Vector3(0.225, 1.31, -0.01), Vector3(0.014, 0.08, 0.03), rust_red).reparent(torso, true)
		box(root, Vector3(0.225, 1.31, -0.01), Vector3(0.014, 0.026, 0.08), rust_red).reparent(torso, true)
		box(root, Vector3(-0.2, 1.08, -0.18), Vector3(0.12, 0.07, 0.025), material(Color("e0d1ad"))).reparent(torso, true)
		box(root, Vector3(-0.2, 1.08, -0.198), Vector3(0.02, 0.05, 0.009), rust_red).reparent(torso, true)
		box(root, Vector3(-0.2, 1.08, -0.2), Vector3(0.05, 0.016, 0.009), rust_red).reparent(torso, true)
		# A small pendant and stitched cuffs distinguish her silhouette in motion.
		orb(root, Vector3(0, 1.27, -0.2), Vector3(0.025, 0.038, 0.012), material(Color("d0ad69")), "Pendant").reparent(torso, true)
		for side in [-1, 1]:
			box(root, Vector3(side * 0.32, 0.91, -0.08), Vector3(0.06, 0.09, 0.24), teal).reparent(torso, true)
	if medic:
		add_actor_hands(root, true)

static func add_actor_hands(root: Node3D, bare_hands: bool = false) -> void:
	var hand_mat := material(Color("c69d7c") if bare_hands else Color("39463f"), "")
	var knuckle_mat := material(Color("d2ad8d") if bare_hands else Color("48564d"), "")
	var nail_mat := material(Color("e0cdb5") if bare_hands else Color("58665b"), "")
	var cuff_mat := material(Color("e0e7d5") if bare_hands else Color("65756b"), "cloth")
	for side in ["ArmL", "ArmR"]:
		var arm := root.get_node_or_null(NodePath(side)) as Node3D
		if arm == null or arm.has_node("CharacterHand"):
			continue
		var hand := Node3D.new()
		hand.name = "CharacterHand"
		hand.position = Vector3(0, -0.32, -0.015)
		arm.add_child(hand)
		orb(hand, Vector3(0, -0.005, -0.012), Vector3(0.066, 0.078, 0.034), hand_mat, "Palm")
		box(hand, Vector3(0, 0.065, 0), Vector3(0.105, 0.05, 0.095), cuff_mat)
		for i in range(4):
			var x := -0.039 + i * 0.026
			orb(hand, Vector3(x, -0.045, -0.032), Vector3(0.013, 0.018, 0.009), knuckle_mat, "Knuckle%d" % i)
			for joint in range(2):
				var finger := MeshInstance3D.new()
				finger.name = "Finger%dJ%d" % [i, joint]
				var finger_mesh := CapsuleMesh.new()
				finger_mesh.radius = 0.009 if i in [0, 3] else 0.010
				finger_mesh.height = 0.043 if joint == 0 else 0.036
				finger_mesh.radial_segments = 10
				finger_mesh.rings = 4
				finger.mesh = finger_mesh
				finger.material_override = hand_mat
				finger.position = Vector3(x, -0.073 - joint * 0.035, -0.03)
				hand.add_child(finger)
			box(hand, Vector3(x, -0.127, -0.039), Vector3(0.011, 0.008, 0.003), nail_mat)
		var thumb := MeshInstance3D.new()
		thumb.name = "Thumb"
		var thumb_mesh := CapsuleMesh.new()
		thumb_mesh.radius = 0.012
		thumb_mesh.height = 0.065
		thumb_mesh.radial_segments = 10
		thumb.mesh = thumb_mesh
		thumb.material_override = hand_mat
		thumb.position = Vector3(-0.065, -0.025, -0.02)
		thumb.rotation.z = -0.62
		hand.add_child(thumb)
		box(hand, Vector3(-0.085, -0.045, -0.035), Vector3(0.014, 0.01, 0.004), nail_mat)

static func protection_pickup(parent: Node3D, helmet: bool) -> void:
	var canvas := material(Color("606c5c"), "cloth")
	if helmet:
		var visual := MeshInstance3D.new()
		var mesh := SphereMesh.new()
		mesh.radius = 0.24
		mesh.height = 0.44
		mesh.is_hemisphere = true
		mesh.radial_segments = 16
		mesh.rings = 8
		visual.mesh = mesh
		visual.material_override = material(Color("69735c"), "metal")
		parent.add_child(visual)
		box(parent, Vector3(0, -0.02, 0), Vector3(0.5, 0.04, 0.46), canvas)
		box(parent, Vector3(-0.18, -0.12, 0), Vector3(0.025, 0.2, 0.025), canvas)
		box(parent, Vector3(0.18, -0.12, 0), Vector3(0.025, 0.2, 0.025), canvas)
	else:
		box(parent, Vector3.ZERO, Vector3(0.4, 0.46, 0.16), canvas)
		for side in [-1, 1]:
			box(parent, Vector3(side * 0.15, 0.27, 0), Vector3(0.08, 0.16, 0.16), canvas)
			for y in [-0.1, 0.04]:
				box(parent, Vector3(side * 0.1, y, -0.11), Vector3(0.16, 0.1, 0.07), canvas)
		box(parent, Vector3(0, 0, -0.085), Vector3(0.025, 0.42, 0.02), material(Color("333f38")))
