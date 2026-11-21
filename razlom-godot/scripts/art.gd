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
		var skin_color := Color("d3ad8e") if medic else Color("c9a786")
		var skin := material(skin_color)
		var head_visual := head.get_node_or_null("Visual") as MeshInstance3D
		if head_visual != null:
			# Match the square, stepped silhouette of the world instead of a smooth ball.
			var head_mesh := BoxMesh.new()
			head_mesh.size = Vector3(0.30, 0.34, 0.30)
			head_visual.mesh = head_mesh
			head_visual.scale = Vector3.ONE
			head_visual.material_override = skin
		# Every facial feature is a small flat block aligned to the same front plane.
		for side in [-1, 1]:
			var ear := box(head, Vector3(side * 0.15, -0.018, -0.008), Vector3(0.045, 0.06, 0.055), skin)
			ear.name = "EarL" if side < 0 else "EarR"
			var eye := Node3D.new()
			eye.name = "EyeL" if side < 0 else "EyeR"
			eye.position = Vector3(side * 0.062, 0.034, -0.153)
			head.add_child(eye)
			var sclera := box(eye, Vector3.ZERO, Vector3(0.04, 0.024, 0.01), material(Color("eee2d2")))
			sclera.name = "Sclera"
			var iris := MeshInstance3D.new()
			iris.name = "Iris"
			var iris_mesh := BoxMesh.new()
			iris_mesh.size = Vector3(0.012, 0.016, 0.004)
			iris.mesh = iris_mesh
			iris.position = Vector3(0, 0, -0.007)
			iris.material_override = material(Color("626c53"))
			eye.add_child(iris)
			var pupil := MeshInstance3D.new()
			pupil.name = "Pupil"
			var pupil_mesh := BoxMesh.new()
			pupil_mesh.size = Vector3(0.006, 0.01, 0.003)
			pupil.mesh = pupil_mesh
			pupil.position = Vector3(0, 0, -0.011)
			pupil.material_override = material(Color("282923"))
			eye.add_child(pupil)
			var brow := box(head, Vector3(side * 0.062, 0.071, -0.16), Vector3(0.03, 0.004, 0.008), material(Color("725946")))
			brow.name = "BrowL" if side < 0 else "BrowR"
			brow.rotation.z = side * -0.01
		# Flat stepped nose and a short mouth line; no spherical details.
		box(head, Vector3(0, -0.005, -0.16), Vector3(0.018, 0.035, 0.018), material(skin_color.lightened(0.035)))
		var nose_tip := box(head, Vector3(0, -0.025, -0.17), Vector3(0.024, 0.014, 0.02), material(skin_color.lightened(0.035)))
		nose_tip.name = "NoseTip"
		box(head, Vector3(0, -0.078, -0.157), Vector3(0.042, 0.006, 0.01), material(Color("805a50")))
		var cap := root.get_node_or_null("Cap") as Node3D
		if cap != null: cap.reparent(head, true)
		var hair_mat := material(Color("544435"))
		if medic:
			var old_hair := root.get_node_or_null("Hair") as Node3D
			if old_hair != null:
				old_hair.reparent(head, true)
				old_hair.position = Vector3(0, 0.19, 0.025)
				var hair_visual := old_hair.get_node_or_null("Visual") as MeshInstance3D
				if hair_visual != null:
					hair_visual.material_override = hair_mat
			# Hair frames the temples only; keep the forehead clear so it cannot
			# merge with the brows into a bar or a third eyebrow.
			for side in [-1, 1]:
				var temple_lock := box(head, Vector3(side * 0.13, 0.02, -0.153), Vector3(0.025, 0.08, 0.022), hair_mat)
				temple_lock.name = "TempleHairL" if side < 0 else "TempleHairR"
			for i in range(5):
				var braid := box(head, Vector3(0.105 + (i % 2) * 0.018, -0.06 - i * 0.04, 0.15), Vector3(0.034, 0.04, 0.04), hair_mat)
				braid.name = "Braid%d" % i
			box(head, Vector3(0.114, -0.27, 0.15), Vector3(0.06, 0.025, 0.055), material(Color("b6c8b8")))
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
			box(root, Vector3(0.015, y, -0.161), Vector3(0.022, 0.022, 0.014), material(Color("b69c6e")), false).reparent(torso, true)
		box(root, Vector3(0.225, 1.31, -0.01), Vector3(0.012, 0.14, 0.13), linen).reparent(torso, true)
		box(root, Vector3(0.225, 1.31, -0.01), Vector3(0.014, 0.08, 0.03), rust_red).reparent(torso, true)
		box(root, Vector3(0.225, 1.31, -0.01), Vector3(0.014, 0.026, 0.08), rust_red).reparent(torso, true)
		box(root, Vector3(-0.2, 1.08, -0.18), Vector3(0.12, 0.07, 0.025), material(Color("e0d1ad"))).reparent(torso, true)
		box(root, Vector3(-0.2, 1.08, -0.198), Vector3(0.02, 0.05, 0.009), rust_red).reparent(torso, true)
		box(root, Vector3(-0.2, 1.08, -0.2), Vector3(0.05, 0.016, 0.009), rust_red).reparent(torso, true)
		# A small rectangular pendant and stitched cuffs suit the block-built kit.
		box(root, Vector3(0, 1.27, -0.2), Vector3(0.025, 0.038, 0.012), material(Color("d0ad69"))).reparent(torso, true)
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
		var palm := box(hand, Vector3(0, -0.005, -0.012), Vector3(0.072, 0.078, 0.034), hand_mat)
		palm.name = "Palm"
		box(hand, Vector3(0, 0.065, 0), Vector3(0.105, 0.05, 0.095), cuff_mat)
		for i in range(4):
			var x := -0.039 + i * 0.026
			var knuckle := box(hand, Vector3(x, -0.045, -0.032), Vector3(0.015, 0.016, 0.012), knuckle_mat)
			knuckle.name = "Knuckle%d" % i
			for joint in range(2):
				var finger := box(hand, Vector3(x, -0.073 - joint * 0.035, -0.03), Vector3(0.016, 0.043 if joint == 0 else 0.036, 0.02), hand_mat)
				finger.name = "Finger%dJ%d" % [i, joint]
			var nail := box(hand, Vector3(x, -0.127, -0.039), Vector3(0.011, 0.008, 0.003), nail_mat)
			nail.name = "Nail%d" % i
		var thumb := box(hand, Vector3(-0.065, -0.025, -0.02), Vector3(0.022, 0.065, 0.022), hand_mat)
		thumb.name = "Thumb"
		thumb.rotation.z = -0.62
		var thumb_joint := box(hand, Vector3(-0.074, -0.045, -0.035), Vector3(0.024, 0.022, 0.018), knuckle_mat)
		thumb_joint.name = "ThumbJoint"
		box(hand, Vector3(-0.085, -0.045, -0.035), Vector3(0.014, 0.01, 0.004), nail_mat)

static func protection_pickup(parent: Node3D, helmet: bool) -> void:
	var canvas := material(Color("606c5c"), "cloth")
	if helmet:
		var visual := MeshInstance3D.new()
		var mesh := BoxMesh.new()
		mesh.size = Vector3(0.46, 0.22, 0.42)
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
