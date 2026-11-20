class_name RazlomDistrict
extends RefCounted
## Hand-authored explorable relay yard, using shared reusable prop assemblies.
static func build(game: Node3D) -> void:
	var yard := Node3D.new()
	yard.name = "RelayYard"
	game.world.add_child(yard)
	var concrete := RazlomArt.material(Color.WHITE, "concrete")
	var rust := RazlomArt.material(Color.WHITE, "rust")
	var tile := RazlomArt.material(Color.WHITE, "tile")
	var plaster := RazlomArt.material(Color.WHITE, "plaster")
	# Clear road between warehouse and new district, with visible destination.
	RazlomArt.box(yard, Vector3(49, -0.02, 10), Vector3(60, 0.12, 5), RazlomArt.material(Color.WHITE, "gravel"))
	for x in [40, 52, 64]:
		RazlomArt.box(yard, Vector3(x, 2.2, 13), Vector3(0.12, 4.4, 0.12), rust, true)
		RazlomArt.box(yard, Vector3(x, 4.3, 12.5), Vector3(0.2, 0.16, 1.2), rust)
	# A walk-in service house, open south face, framed windows on east wall.
	RazlomArt.box(yard, Vector3(68, 0.08, 20), Vector3(12, 0.25, 10), tile, true)
	for x in [62, 74]:
		RazlomArt.box(yard, Vector3(x, 0.8, 20), Vector3(0.25, 1.6, 10), plaster, true)
		RazlomArt.box(yard, Vector3(x, 3.2, 20), Vector3(0.25, 0.6, 10), plaster, true)
		for z in [15, 20, 25]:
			RazlomArt.box(yard, Vector3(x, 2.2, z), Vector3(0.3, 1.4, 0.25), rust, true)
	RazlomArt.box(yard, Vector3(68, 1.75, 25), Vector3(12, 3.5, 0.25), plaster, true)
	RazlomArt.box(yard, Vector3(68, 3.6, 20), Vector3(12.5, 0.2, 10.5), rust, true)
	RazlomArt.sign_text(yard, "РЕТРАНСЛЯТОР / 12", Vector3(68, 3, 14.8), 37)
	# Radio desk, ceramic fuses, handwheel and articulated antenna.
	RazlomArt.box(yard, Vector3(68, 0.65, 23), Vector3(3, 1.3, 0.9), rust, true)
	for x in [67.2, 68, 68.8]:
		RazlomArt.box(yard, Vector3(x, 1.55, 23), Vector3(0.65, 0.45, 0.45), concrete)
		RazlomArt.box(yard, Vector3(x, 1.57, 22.76), Vector3(0.45, 0.18, 0.02), RazlomArt.material(Color("88b49a"), "", 0.3))
	var radio := StaticBody3D.new()
	radio.name = "RelayRadio"
	radio.set_meta("use", "relay")
	radio.set_meta("title", "Архив ретранслятора • прослушать")
	yard.add_child(radio)
	radio.position = Vector3(68, 1.6, 22.6)
	var collider := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = Vector3(3, 0.7, 0.5)
	collider.shape = shape
	radio.add_child(collider)
	for i in range(5):
		var h := float(i) * 1.4
		RazlomArt.box(yard, Vector3(77, h + 0.7, 23), Vector3(0.18, 1.5, 0.18), rust, true)
		RazlomArt.box(yard, Vector3(77, h + 1, 23), Vector3(2.0 - i * 0.25, 0.06, 0.06), rust)
	# New prop assemblies: bus stop, open cable drums and stacked sandbags.
	for pos in [Vector3(47, 0, 18), Vector3(56, 0, -1)]:
		for x in [-1.2, 1.2]:
			RazlomArt.box(yard, pos + Vector3(x, 1.3, 0), Vector3(0.12, 2.6, 0.12), rust, true)
		RazlomArt.box(yard, pos + Vector3(0, 2.65, 0), Vector3(3, 0.14, 2), rust, true)
		RazlomArt.box(yard, pos + Vector3(0, 0.6, 0.5), Vector3(2.6, 0.16, 0.7), RazlomArt.material(Color.WHITE, "wood"), true)
	for i in range(6):
		var pos := Vector3(42 + i * 4, 0.3, -5)
		RazlomArt.box(yard, pos, Vector3(2, 0.6, 1), RazlomArt.material(Color.WHITE, "sandbag"), true)
		RazlomArt.box(yard, pos + Vector3(0.2, 0.55, 0), Vector3(1.6, 0.5, 0.9), RazlomArt.material(Color.WHITE, "sandbag"), true)
	for pos in [Vector3(58, 0, 28), Vector3(49, 0, 27)]:
		for x in [-0.5, 0.5]:
			RazlomArt.box(yard, pos + Vector3(x, 0.65, 0), Vector3(0.15, 1.3, 1.3), RazlomArt.material(Color.WHITE, "wood"), true)
		RazlomArt.box(yard, pos + Vector3(0, 0.65, 0), Vector3(1, 0.9, 0.9), rust, true)
	game.spawn_loot("armor", Vector3(-24, 1.2, 19), "Бронежилет • защита груди", "shelter_armor")
	game.spawn_loot("helmet", Vector3(67, 1.5, 23), "Шлем • защита головы", "relay_helmet")
	game.spawn_loot("medkit", Vector3(70, 0.6, 19), "Аптечка ретранслятора", "relay_med")
