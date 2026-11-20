class_name RazlomQuestLocations
extends RefCounted
static func station(game: Node3D, pos: Vector3, id: String, title: String, color: Color) -> StaticBody3D:
	var root := StaticBody3D.new()
	root.name = "Quest_" + id
	root.set_meta("use", "quest")
	root.set_meta("quest", id)
	root.set_meta("title", title)
	game.world.add_child(root)
	root.position = pos
	RazlomArt.box(root, Vector3(0, 0.55, 0), Vector3(0.85, 1.1, 0.65), RazlomArt.material(Color.WHITE, "rust"))
	RazlomArt.box(root, Vector3(0, 1.16, 0), Vector3(0.65, 0.12, 0.5), RazlomArt.material(color, "", 0.4))
	var collision := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = Vector3(0.9, 1.3, 0.7)
	collision.shape = shape
	collision.position.y = 0.65
	root.add_child(collision)
	RazlomArt.sign_text(root, title, Vector3(0, 1.65, 0), 20)
	return root
static func build(game: Node3D) -> void:
	station(game, Vector3(-21, 0.2, 24), "board", "ДЕЛА ОЧАГА / E", Color("e9ca8b"))
	station(game, Vector3(-38, 0, -12), "medicine", "МЕДИЦИНСКИЙ ШКАФ", Color("c0d8c1"))
	station(game, Vector3(-51, 0, -31), "fuse", "ЯЩИК МОНТАЖНИКА", Color("e2bf7a"))
	station(game, Vector3(-43, 0, -43), "switch", "ПОДСТАНЦИЯ / РЕЗЕРВ", Color("89b7a3"))
	station(game, Vector3(-12, 0, -60), "gate", "РЕГИСТРАТОР ШЛЮЗА", Color("9fc6cc"))
	var points := [Vector3(-32, 0, -38), Vector3(-55, 0, -39), Vector3(-57, 0, -18)]
	for i in range(3):
		station(game, points[i], "survey_%d" % (i + 1), "ЗАМЕР %d / E" % (i + 1), Color("8db9c4"))
	# A roofed aid post and an accessible substation, not just floating markers.
	for pos in [Vector3(-38, 0, -12), Vector3(-43, 0, -43)]:
		var metal := RazlomArt.material(Color.WHITE, "rust")
		for x in [-2, 2]:
			RazlomArt.box(game.world, pos + Vector3(x, 1.6, 0), Vector3(0.18, 3.2, 4), metal, true)
		RazlomArt.box(game.world, pos + Vector3(0, 3.3, 0), Vector3(4.5, 0.15, 4.5), metal, true)
	# Rubble-blocked northern gate: the archive is accessible in front of it.
	for x in [-18, -7]:
		RazlomArt.box(game.world, Vector3(x, 2.5, -64), Vector3(0.6, 5, 0.6), RazlomArt.material(Color.WHITE, "concrete"), true)
	RazlomArt.box(game.world, Vector3(-12.5, 4.7, -64), Vector3(11, 0.4, 0.4), RazlomArt.material(Color.WHITE, "rust"), true)
	for i in range(5):
		RazlomArt.box(game.world, Vector3(-17 + i * 2, 0.6, -65), Vector3(2.3, 1.4, 2), RazlomArt.material(Color.WHITE, "concrete"), true)
	var engineer := station(game, Vector3(-42, 0, -5), "engineer", "СЕМЁН / ПОМОЧЬ", Color("b4c1a2"))
	# Remove cabinet visual, keep interaction collider; seated modular character.
	for child in engineer.get_children():
		if child is Node3D and not child is CollisionShape3D and not child is Label3D:
			child.queue_free()
	var model := RazlomArt.humanoid(engineer)
	model.get_node("Weapon").hide()
	model.position.y = -0.25
	model.get_node("LegL").rotation.x = -0.9
	model.get_node("LegR").rotation.x = -0.9
	RazlomArt.box(engineer, Vector3(0, 0.18, 0.12), Vector3(1.2, 0.35, 0.8), RazlomArt.material(Color.WHITE, "wood"), true)
