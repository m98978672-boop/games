extends Node3D
## First slice: a hand-built small level, not the full campaign or trained AI.
const Art = preload("res://scripts/art.gd")
const PlayerScript = preload("res://scripts/player.gd")
const EnemyScript = preload("res://scripts/enemy.gd")
const BlockScript = preload("res://scripts/block.gd")
const StateScript = preload("res://scripts/state.gd")
const InteractionsScript = preload("res://scripts/interactions.gd")
const DogScript = preload("res://scripts/dog.gd")
var state = StateScript.new()
var interactions = InteractionsScript.new()
var quests := RazlomQuests.new()
var shot_rng := RandomNumberGenerator.new()
var last_shot_direction := Vector3.FORWARD
var mobile_mode := false
var touch_ui: RazlomTouchControls
var day_minutes := 462.0
var save_path := "user://razlom-save.json"
var player
var dog
var world: Node3D
var hud: CanvasLayer
var combat_feedback: RazlomCombatFeedback
var stats_label: Label
var mission_label: Label
var clock_label: Label
var hint_label: Label
var message_label: Label
var aim_reticle: Control
var menu_style := RazlomMenuStyle.new()
var modal: PanelContainer
var modal_title: Label
var modal_body: Label
var start_button: Button
var save_button: Button
var resume_button: Button
var blocks: Dictionary = {}
var destroyed: Array = []
var collected: Array = []
var defeated: Array = []
var enemies: Array = []
var loot_index := 0
var ended := false
var death_age := -1.0
var started := false
var message_time := 0.0
var music: AudioStreamPlayer
var music_enabled := true
var shot_sound: AudioStreamPlayer
var sound_playback: AudioStreamGeneratorPlayback
var audio_rng := RandomNumberGenerator.new()
var world_rng := RandomNumberGenerator.new()
var elapsed := 0.0
var web_report_time := 0.0
var active_debris := 0
var active_charges := 0
var world_epoch := 0
var navigation := AStarGrid2D.new()
var nav_dirty := false
var sensitivity := 0.0022
var look_scale := 1.0
var sensitivity_step := 1
var low_quality := false
var ambience: WorldEnvironment
var world_state_applied := ""

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	world_rng.seed = 7301
	audio_rng.seed = 8201
	interactions.game = self
	quests.game = self
	shot_rng.randomize()
	bind_keys()
	mobile_mode = DisplayServer.is_touchscreen_available()
	if mobile_mode:
		get_window().size_changed.connect(fit_mobile)
		fit_mobile()
	setup_environment()
	world = Node3D.new()
	world.process_mode = Node.PROCESS_MODE_PAUSABLE
	add_child(world)
	build_level()
	refresh_world_state()
	refresh_navigation()
	player = PlayerScript.new()
	player.game = self
	player.process_mode = Node.PROCESS_MODE_PAUSABLE
	player.position = Vector3(-22, 0.3, 20)
	player.rotation.y = PI
	add_child(player)
	setup_audio()
	setup_hud()
	if mobile_mode:
		toggle_quality()
	var briefing := "ТЁПЛАЯ СТЕНА / ГЛАВА 01\n\nВозьми винтовку на полке у задней стены. Найди насос на складе и вернись к Вере. Павел подскажет мирный проход.\n\nЛевый круг — идти; справа — смотреть. Кнопка ВЗЯТЬ — действие." if mobile_mode else "ТЁПЛАЯ СТЕНА / ГЛАВА 01\n\nВера: «На станции остался насосный блок. Сыну Рады осталось воды на одну ночь. И кому-то было приказано не пускать нас на склад».\n\n1. Возьми винтовку на полке у задней стены убежища.\n2. Выйди из убежища и следуй направлению слева сверху.\n3. Найди насос на складе и верни его сюда.\n\nПоговори со связным Павлом о проходе без боя. Охрану можно обойти.\nУправление: WASD — идти, мышь — смотреть, E — взять, ПКМ — прицел вкл/выкл, Esc — пауза."
	show_menu("РАЗЛОМ", briefing)

func fit_mobile() -> void:
	var pixels := get_window().size
	var base := Vector2i(390, 700) if pixels.y > pixels.x else Vector2i(844, 390)
	if get_window().content_scale_size != base:
		get_window().content_scale_size = base

func bind_keys() -> void:
	var keys := {"forward": KEY_W, "back": KEY_S, "left": KEY_A, "right": KEY_D,
		"sprint": KEY_SHIFT, "jump": KEY_SPACE, "reload": KEY_R, "interact": KEY_E,
		"charge": KEY_G, "heal": KEY_H, "eat": KEY_1, "drink": KEY_2, "flashlight": KEY_F, "crouch": KEY_C}
	for action in keys:
		if not InputMap.has_action(action):
			InputMap.add_action(action)
		InputMap.action_erase_events(action)
		var key := InputEventKey.new()
		key.physical_keycode = keys[action]
		InputMap.action_add_event(action, key)
	for action in ["fire", "aim"]:
		if not InputMap.has_action(action):
			InputMap.add_action(action)
		InputMap.action_erase_events(action)
		var event := InputEventMouseButton.new()
		event.button_index = MOUSE_BUTTON_LEFT if action == "fire" else MOUSE_BUTTON_RIGHT
		InputMap.action_add_event(action, event)

func setup_environment() -> void:
	ambience = WorldEnvironment.new()
	var env := Environment.new()
	env.background_mode = Environment.BG_SKY
	var sky := Sky.new()
	var sky_mat := ProceduralSkyMaterial.new()
	sky_mat.sky_top_color = Color("335f68")
	sky_mat.sky_horizon_color = Color("c4c1a3")
	sky_mat.ground_bottom_color = Color("283f3c")
	sky_mat.ground_horizon_color = Color("aaa68a")
	sky.sky_material = sky_mat
	env.sky = sky
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color("a6c1ba")
	env.ambient_light_energy = 0.65
	env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	env.fog_enabled = true
	env.fog_light_color = Color("809c94")
	env.fog_density = 0.006
	ambience.environment = env
	add_child(ambience)
	var sun := DirectionalLight3D.new()
	sun.name = "Sun"
	sun.rotation_degrees = Vector3(-28, -35, 0)
	sun.light_color = Color("ffda9c")
	sun.light_energy = 1.8
	sun.shadow_enabled = true
	sun.directional_shadow_max_distance = 70
	add_child(sun)

func build_level() -> void:
	var concrete := Art.material(Color.WHITE, "concrete")
	var metal := Art.material(Color.WHITE, "metal")
	var wood := Art.material(Color.WHITE, "wood")
	var ground := Art.material(Color.WHITE, "ground")
	Art.box(world, Vector3(0, -0.6, 0), Vector3(176, 1, 176), ground, true)
	Art.box(world, Vector3(0, -0.03, 12), Vector3(10, 0.12, 95), Art.material(Color.WHITE, "asphalt"))
	for z in range(-40, 55, 6):
		Art.box(world, Vector3(0, 0.05, z), Vector3(0.16, 0.02, 2), Art.material(Color("b6b38a")))
	# Explicit map boundary: large cliffs with collision, never an invisible wall.
	for i in range(44):
		for side in [-1, 1]:
			var h := world_rng.randf_range(4, 9)
			Art.box(world, Vector3(-86 + i * 4, h * 0.5, side * 85), Vector3(4.2, h, 5), concrete, true)
			Art.box(world, Vector3(side * 85, h * 0.5, -86 + i * 4), Vector3(5, h, 4.2), concrete, true)
	for i in range(52):
		var pos := Vector3(world_rng.randf_range(-55, 55), 0, world_rng.randf_range(-53, 53))
		if absf(pos.x) < 30 and pos.z > -28 and pos.z < 35:
			continue
		Art.tree(world, pos, world_rng.randf_range(4.5, 7.5))
	# Shelter, open on the south side.
	Art.box(world, Vector3(-23, 0.08, 22), Vector3(10, 0.25, 9), concrete, true)
	Art.box(world, Vector3(-28, 1.8, 22), Vector3(0.3, 3.6, 9), wood, true)
	Art.box(world, Vector3(-18, 1.8, 22), Vector3(0.3, 3.6, 9), wood, true)
	Art.box(world, Vector3(-23, 1.8, 17.5), Vector3(10, 3.6, 0.3), wood, true)
	Art.box(world, Vector3(-24, 0.72, 17.84), Vector3(1.55, 0.12, 0.48), wood)
	Art.box(world, Vector3(-24.55, 0.85, 17.72), Vector3(0.12, 0.22, 0.16), metal)
	Art.box(world, Vector3(-23.45, 0.85, 17.72), Vector3(0.12, 0.22, 0.16), metal)
	Art.box(world, Vector3(-23, 3.7, 22), Vector3(10.8, 0.3, 9.8), metal, true)
	Art.sign_text(world, "ОЧАГ / 07", Vector3(-23, 3.1, 26.9), 62)
	Art.box(world, Vector3(-25, 0.5, 19), Vector3(2.1, 0.8, 1), wood, true)
	Art.box(world, Vector3(-25, 0.98, 19), Vector3(2, 0.15, 0.9), Art.material(Color("aaa07c")))
	Art.box(world, Vector3(-20, 0.65, 19), Vector3(2, 1.3, 0.8), metal, true)
	decorate_shelter()
	interactions.spawn_shelter(world)
	dog = DogScript.new()
	dog.game = self
	dog.name = "Dog"
	dog.position = Vector3(-19, 0.3, 25)
	world.add_child(dog)
	lamp(Vector3(-23, 2.9, 21), Color("ffc780"), 7)
	# Warehouse: frame is deliberately non-destructible; brick infill can fall.
	Art.box(world, Vector3(16, 0, -16), Vector3(18, 0.22, 16), concrete, true)
	for x in [7, 25]:
		for z in [-24, -8]:
			Art.box(world, Vector3(x, 2.5, z), Vector3(0.35, 5, 0.35), metal, true)
	Art.box(world, Vector3(16, 5.2, -16), Vector3(19, 0.3, 17), metal, true)
	for y in range(4):
		for x in range(8, 25):
			make_block(Vector3(x, 0.65 + y, -24), "back_%d_%d" % [x, y])
			if x < 14 or x > 18:
				make_block(Vector3(x, 0.65 + y, -8), "front_%d_%d" % [x, y])
		for z in range(-23, -8):
			make_block(Vector3(7, 0.65 + y, z), "left_%d_%d" % [z, y])
			make_block(Vector3(25, 0.65 + y, z), "right_%d_%d" % [z, y])
	Art.sign_text(world, "ВОДОСНАБЖЕНИЕ", Vector3(16, 4.65, -7.65), 55)
	Art.sign_text(world, "СКЛАД 03 / РЕЗЕРВ", Vector3(16, 4.05, -7.65), 29, Color("bdc8a9"))
	decorate_warehouse()
	for pos in [Vector3(11, 0.6, -20), Vector3(22, 0.6, -12), Vector3(20, 0.6, -21), Vector3(10, 0.6, -12)]:
		Art.box(world, pos, Vector3(2.4, 1.2, 1.5), wood, true)
	lamp(Vector3(16, 4.5, -13), Color("91d8c7"), 9)
	Art.truck(world, Vector3(4, 0, 3))
	# Original skyline silhouettes, not promised explorable buildings.
	for i in range(9):
		var h := world_rng.randf_range(8, 18)
		Art.box(world, Vector3(-49 + i * 11, h * 0.5, -50), Vector3(7, h, 5), concrete, true)
	for pos in [Vector3(-8, 0.5, 5), Vector3(4, 0.5, -2), Vector3(4, 0.5, -4)]:
		Art.box(world, pos, Vector3(2.5, 1, 0.7), concrete, true)
	for pos in [Vector3(-14, 0.4, 7), Vector3(-10, 0.4, -12), Vector3(30, 0.4, 1)]:
		Art.box(world, pos, Vector3(2.1, 0.8, 1.5), Art.material(Color.WHITE, "rust"), true)
	spawn_loot("pump", Vector3(21, 1.4, -20), "НАСОСНЫЙ БЛОК", "mission_pump")
	spawn_loot("record", Vector3(11, 1.4, -12), "НАКЛАДНАЯ / прочитать", "warehouse_manifest")
	spawn_loot("food", Vector3(-25, 1.2, 19), "Консервы • +1", "shelter_food")
	spawn_loot("water", Vector3(-20, 1.5, 19), "Вода • +1", "shelter_water")
	spawn_loot("rifle", Vector3(-24, 0.98, 18.02), "Винтовка у стены • взять", "starter_rifle")
	spawn_loot("medkit", Vector3(11, 1.4, -20), "Аптечка • +1", "warehouse_med")
	spawn_loot("scrap", Vector3(-10, 1.1, -12), "Детали • +3", "scrap_01")
	spawn_loot("scrap", Vector3(-14, 1.1, 7), "Детали • +3", "scrap_02")
	spawn_loot("scrap", Vector3(30, 1.1, 1), "Детали • +3", "scrap_03")
	RazlomDistrict.build(self)
	RazlomQuestLocations.build(self)
	for i in range(3):
		var guard = EnemyScript.new()
		guard.name = "guard_%d" % i
		guard.game = self
		guard.process_mode = Node.PROCESS_MODE_PAUSABLE
		guard.position = [Vector3(14, 0.3, -4), Vector3(20, 0.3, -17), Vector3(30, 0.3, -18)][i]
		world.add_child(guard)
		enemies.append(guard)

func decorate_shelter() -> void:
	var timber := Art.material(Color("6c6250"), "wood")
	var warm_metal := Art.material(Color("8e8067"), "metal")
	# Layered doorway, rain lip and window framing break up the plain box silhouette.
	Art.box(world, Vector3(-23, 3.82, 26.42), Vector3(4.8, 0.18, 0.35), warm_metal)
	for x in [-27.5, -18.5]:
		Art.box(world, Vector3(x, 1.8, 17.31), Vector3(0.09, 3.15, 0.09), timber)
		Art.box(world, Vector3(x, 3.35, 17.31), Vector3(0.42, 0.09, 0.12), warm_metal)
	for z in [19.2, 20.8, 22.4, 24.0]:
		Art.box(world, Vector3(-18.18, 2.0, z), Vector3(0.045, 0.035, 0.55), warm_metal)
	Art.box(world, Vector3(-18.18, 2.0, 21.6), Vector3(0.045, 1.65, 0.04), warm_metal)
	# A hand-painted direction board, hanging herbs and shared outdoor sitting space.
	Art.box(world, Vector3(-27.55, 2.55, 24.5), Vector3(0.12, 0.62, 1.5), timber)
	Art.sign_text(world, "ВОДА  /  ТЕПЛО  /  ДОМ", Vector3(-27.45, 2.64, 24.5), 17, Color("e3d8b9"))
	for x in [-27.8, -26.8, -25.8]:
		Art.box(world, Vector3(x, 2.85, 17.28), Vector3(0.32, 0.2, 0.12), Art.material(Color("62755e"), "cloth"))
		Art.box(world, Vector3(x, 2.66, 17.28), Vector3(0.018, 0.24, 0.02), Art.material(Color("748b69")))
	var bench := Art.box(world, Vector3(-21.5, 0.42, 27.4), Vector3(2.0, 0.16, 0.5), timber, true)
	bench.name = "ShelterBench"
	for x in [-22.2, -20.8]:
		Art.box(world, Vector3(x, 0.2, 27.4), Vector3(0.12, 0.44, 0.4), timber, true)
	Art.box(world, Vector3(-23, 3.65, 26.55), Vector3(6.0, 0.07, 0.06), warm_metal)
	for x in [-25.1, -23.7, -22.3, -20.9]:
		var bulb := Art.orb(world, Vector3(x, 3.48, 26.55), Vector3.ONE * 0.09, Art.material(Color("f2cb85"), "", 0.8), "ShelterBulb")
		bulb.position.y += sin((x + 26) * 1.5) * 0.06

func decorate_warehouse() -> void:
	var oxidized := Art.material(Color("887a62"), "rust")
	var pale := Art.material(Color("b9ad91"), "concrete")
	# Recessed sign frame, loading-bay lintel, and repaired sheet-metal patches.
	Art.box(world, Vector3(16, 4.75, -7.53), Vector3(12.2, 0.12, 0.18), oxidized)
	for x in [10.0, 22.0]:
		Art.box(world, Vector3(x, 4.28, -7.53), Vector3(0.12, 0.88, 0.18), oxidized)
		Art.box(world, Vector3(x, 1.9, -7.48), Vector3(0.16, 3.7, 0.12), oxidized)
	for x in [8.0, 24.0]:
		for y in [0.7, 4.2]:
			Art.orb(world, Vector3(x, y, -7.42), Vector3.ONE * 0.06, pale, "Rivet")
	for y in [1.05, 2.25, 3.45]:
		Art.box(world, Vector3(16, y, -7.49), Vector3(0.28, 0.05, 0.06), oxidized)
	# Downpipe and battered rain hood along the west corner.
	Art.box(world, Vector3(6.72, 2.5, -8.8), Vector3(0.12, 5.0, 0.12), oxidized)
	Art.box(world, Vector3(16, 5.02, -7.3), Vector3(16, 0.08, 0.55), oxidized)
	for x in [7.3, 24.7]:
		Art.box(world, Vector3(x, 2.4, -8.02), Vector3(0.08, 4.5, 0.12), pale)

func refresh_world_state() -> void:
	if not is_instance_valid(world):
		return
	var key := "%s|%s|%s|%s" % [state.complete, state.quests, state.vera_bond, state.relay_shared]
	if key == world_state_applied:
		return
	world_state_applied = key
	var upgrades := world.get_node_or_null("ShelterImprovements") as Node3D
	if state.complete and upgrades == null:
		upgrades = Node3D.new()
		upgrades.name = "ShelterImprovements"
		world.add_child(upgrades)
		upgrades.position = Vector3(-30.5, 0, 23)
		var metal := Art.material(Color("7c8174"), "metal")
		var wood := Art.material(Color("655b48"), "wood")
		var water := Art.material(Color("76a99c"), "", 0.22)
		var tank := MeshInstance3D.new()
		var tank_mesh := CylinderMesh.new()
		tank_mesh.top_radius = 0.72
		tank_mesh.bottom_radius = 0.72
		tank_mesh.height = 1.8
		tank.name = "WaterTank"
		tank.mesh = tank_mesh
		tank.material_override = metal
		tank.position = Vector3(0, 1.0, 0)
		upgrades.add_child(tank)
		Art.box(upgrades, Vector3(0, 1.33, -0.725), Vector3(1.1, 0.28, 0.035), water)
		for y in [0.25, 1.75]:
			Art.box(upgrades, Vector3(0, y, 0), Vector3(1.5, 0.08, 1.5), wood)
		Art.box(upgrades, Vector3(0.55, 2.05, 0), Vector3(0.12, 0.35, 0.12), metal)
		Art.sign_text(upgrades, "ЗАПАС ВОДЫ / ОЧАГ", Vector3(0, 2.35, -0.8), 20)
		# Raised kitchen garden adds a visible, small recovery of the shelter courtyard.
		Art.box(upgrades, Vector3(2.4, 0.35, 1.4), Vector3(2.2, 0.35, 1.4), wood)
		Art.box(upgrades, Vector3(2.4, 0.54, 1.4), Vector3(2.0, 0.06, 1.2), Art.material(Color("544b38"), "ground"))
		for i in range(7):
			var plant_pos := Vector3(1.65 + (i % 3) * 0.68, 0.76, 0.95 + float(i / 3) * 0.55)
			Art.box(upgrades, plant_pos, Vector3(0.08, 0.42, 0.08), Art.material(Color("56745a")))
			for leaf in [-1, 1]:
				var leaf_node := Art.orb(upgrades, plant_pos + Vector3(leaf * 0.11, 0.12, 0), Vector3(0.2, 0.08, 0.11), Art.material(Color("74906b")), "GardenLeaf")
				leaf_node.rotation.z = leaf * 0.3
		lamp(Vector3(-30.5, 2.5, 23), Color("f2c784"), 6)
		Art.sign_text(world, "ПОСЛЕ НАСОСА: ВОДА ВЕРНУЛАСЬ", Vector3(-24.4, 3.1, 25.4), 25, Color("a9d0b6"))
	if state.quests.get("power", 0) == 3 and world.get_node_or_null("SubstationRestored") == null:
		var substation := Node3D.new()
		substation.name = "SubstationRestored"
		world.add_child(substation)
		substation.position = Vector3(-43, 0, -43)
		Art.box(substation, Vector3(2.9, 0.78, 0), Vector3(1.35, 1.5, 1.1), Art.material(Color("827d68"), "metal"), true)
		Art.box(substation, Vector3(2.9, 1.58, -0.56), Vector3(0.72, 0.36, 0.035), Art.material(Color("496d5f"), "", 0.5))
		Art.box(substation, Vector3(2.9, 0.55, -0.61), Vector3(0.08, 0.52, 0.08), Art.material(Color("c69c5d"), "metal"))
		Art.sign_text(substation, "РЕЗЕРВНАЯ ЛИНИЯ • ВКЛЮЧЕНА", Vector3(2.9, 2.15, -0.65), 16, Color("a8d3b4"))
		var indicator := OmniLight3D.new()
		indicator.name = "LiveIndicator"
		indicator.position = Vector3(2.9, 1.65, -0.7)
		indicator.light_color = Color("83cba0")
		indicator.light_energy = 0.8
		indicator.omni_range = 3.5
		substation.add_child(indicator)
	if state.quests.get("gate", 0) in [3, 4] and world.get_node_or_null("WorldDecisionNotice") == null:
		var notice := Node3D.new()
		notice.name = "WorldDecisionNotice"
		world.add_child(notice)
		notice.position = Vector3(-21.0, 0, 26.0)
		Art.box(notice, Vector3(-0.05, 1.35, 0), Vector3(1.5, 1.0, 0.14), Art.material(Color("625b48"), "wood"))
		Art.sign_text(notice, "ПРИКАЗ ОБНАРОДОВАН" if state.quests.gate == 3 else "ИМЕНА СОХРАНЕНЫ В ТАЙНЕ", Vector3(-0.05, 1.4, -0.09), 14, Color("e4cf9d"))
	if state.vera_bond >= 1 and upgrades != null and upgrades.get_node_or_null("EveningTable") == null:
		var table := Art.box(upgrades, Vector3(2.3, 0.86, 3.35), Vector3(1.3, 0.1, 0.8), Art.material(Color("735d45"), "wood"))
		table.name = "EveningTable"
		for x in [-0.48, 0.48]:
			Art.box(upgrades, Vector3(2.3 + x, 0.42, 3.35), Vector3(0.08, 0.85, 0.72), Art.material(Color("665340"), "wood"))
		for x in [1.9, 2.65]:
			var cup := Art.box(upgrades, Vector3(x, 0.98, 3.35), Vector3(0.16, 0.16, 0.16), Art.material(Color("d4c8a7"), "tile"))
			cup.name = "TeaCup"
		lamp(Vector3(-28.0, 2.25, 26.4), Color("f3cb88"), 5)
		Art.sign_text(upgrades, "НАШ ТИХИЙ УГОЛ", Vector3(2.3, 1.3, 3.35), 17, Color("e3d5b3"))

func lamp(pos: Vector3, color: Color, radius: float) -> void:
	Art.box(world, pos, Vector3(0.7, 0.12, 0.35), Art.material(color, "", 1))
	var light := OmniLight3D.new()
	light.position = pos - Vector3.UP * 0.2
	light.light_color = color
	light.light_energy = 2
	light.omni_range = radius
	light.shadow_enabled = false
	world.add_child(light)

func make_block(pos: Vector3, id: String) -> void:
	var block = BlockScript.new()
	block.game = self
	block.block_id = id
	# Stable per-block variation: saved/damaged bricks keep the same finish after reload.
	var variant_rng := RandomNumberGenerator.new()
	variant_rng.seed = abs(id.hash()) + 1
	var palettes := [Color("d0c2a6"), Color("b9a991"), Color("c6b79b"), Color("d5c9b1"), Color("a99a80")]
	block.tint = palettes[variant_rng.randi_range(0, palettes.size() - 1)]
	world.add_child(block)
	block.position = pos
	var visual := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	mesh.size = Vector3(variant_rng.randf_range(0.94, 0.99), 0.97, variant_rng.randf_range(0.94, 0.99))
	visual.mesh = mesh
	visual.position.y = variant_rng.randf_range(-0.01, 0.01)
	visual.rotation.y = deg_to_rad(float(variant_rng.randi_range(-2, 2)))
	visual.material_override = Art.material(block.tint, "brick")
	block.add_child(visual)
	var shape := CollisionShape3D.new()
	var box := BoxShape3D.new()
	box.size = Vector3.ONE
	shape.shape = box
	block.add_child(shape)
	blocks[id] = block

func break_block(block, impulse: Vector3) -> void:
	if not is_instance_valid(block) or not blocks.has(block.block_id):
		return
	var pos: Vector3 = block.global_position
	var id: String = block.block_id
	blocks.erase(id)
	if not destroyed.has(id):
		destroyed.append(id)
	block.queue_free()
	nav_dirty = true
	if active_debris < 32:
		active_debris += 1
		var body := RigidBody3D.new()
		body.mass = 12
		body.collision_layer = 1 | 8
		body.collision_mask = 1 | 8
		world.add_child(body)
		body.add_to_group("rubble")
		body.global_position = pos
		var mesh := MeshInstance3D.new()
		var cube := BoxMesh.new()
		cube.size = Vector3.ONE * 0.78
		mesh.mesh = cube
		mesh.material_override = Art.material(Color.WHITE, "brick")
		body.add_child(mesh)
		var col := CollisionShape3D.new()
		var shape := BoxShape3D.new()
		shape.size = cube.size
		col.shape = shape
		body.add_child(col)
		body.apply_central_impulse(impulse + Vector3.UP * 1.5)
		var body_ref: WeakRef = weakref(body)
		get_tree().create_timer(12, false).timeout.connect(func():
			var live_body: RigidBody3D = body_ref.get_ref()
			if live_body != null:
				live_body.freeze = true
				live_body.collision_layer = 1
				live_body.collision_mask = 1
				active_debris -= 1
				nav_dirty = true)
	# Only the brick infill column loses support; steel frame remains intact.
	for candidate in blocks.values():
		if is_instance_valid(candidate) and absf(candidate.position.x - pos.x) < 0.1 and absf(candidate.position.z - pos.z) < 0.1 and candidate.position.y > pos.y:
			candidate.hit(999, impulse * 0.3)

func spawn_loot(kind: String, pos: Vector3, title: String, id: String = "") -> void:
	var item := StaticBody3D.new()
	loot_index += 1
	item.name = "loot_%d" % loot_index
	item.set_meta("loot", kind)
	item.set_meta("title", title)
	item.set_meta("id", id if not id.is_empty() else item.name)
	item.add_to_group("loot")
	world.add_child(item)
	item.position = pos
	var color := Color("81c2a8") if kind == "pump" else Color("c7ab6d")
	if kind == "rifle":
		var weapon: Node3D = load("res://assets/models/carbine.tscn").instantiate()
		item.add_child(weapon)
		weapon.position = Vector3(0, 0, 0)
		weapon.rotation.z = PI * 0.5
		weapon.scale = Vector3.ONE * 0.9
		weapon.get_node("LeftHand").hide()
		weapon.get_node("RightHand").hide()
		var label := Art.sign_text(item, "ВИНТОВКА / E", Vector3(0, 0.52, 0), 22, Color("e5d9b5"))
		label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	elif kind in ["armor", "helmet"]:
		Art.protection_pickup(item, kind == "helmet")
	else:
		Art.box(item, Vector3.ZERO, Vector3(0.55, 0.4, 0.4), Art.material(color, "metal"))
		Art.box(item, Vector3(0, 0.24, 0), Vector3(0.28, 0.08, 0.15), Art.material(Color("c7c7a7")))
	var collision := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = Vector3(0.8, 0.4, 1.1) if kind == "rifle" else Vector3(0.6, 0.5, 0.5)
	collision.shape = shape
	item.add_child(collision)
	if kind == "pump":
		var label := Art.sign_text(item, "НАСОС / E", Vector3(0, 0.65, 0), 25, Color("85d0b2"))
		label.billboard = BaseMaterial3D.BILLBOARD_ENABLED

func ray(distance: float = 65.0) -> Dictionary:
	var from: Vector3 = player.camera.global_position
	var to: Vector3 = from - player.camera.global_basis.z * distance
	var query := PhysicsRayQueryParameters3D.create(from, to, 1 | 4 | 16)
	query.exclude = [player.get_rid()]
	return get_world_3d().direct_space_state.intersect_ray(query)

func fire() -> void:
	# Compute dispersion before adding this shot to recoil/bloom.
	last_shot_direction = player.sample_shot_direction(shot_rng)
	player.on_shot()
	noise(player.global_position, 24)
	play_tone(95, 0.07, 0.22)
	var query := PhysicsRayQueryParameters3D.create(player.camera.global_position, player.camera.global_position + last_shot_direction * 80, 1 | 4 | 8 | 16)
	query.exclude = [player.get_rid()]
	var hit := get_world_3d().direct_space_state.intersect_ray(query)
	if not hit.is_empty():
		var object: Object = hit.collider
		if object is RazlomEnemy:
			combat_feedback.hit_time = 0.18
		impact_particles(hit.position, hit.normal)
		if object is RazlomBlock:
			object.bullet_hit(hit.position, last_shot_direction, 0.012, 36.0)
		elif object is RazlomEnemy:
			object.hit_at(36, hit.position, hit.normal, last_shot_direction * 9)
		elif object.has_method("hit_at"):
			object.hit_at(36, hit.position, hit.normal, last_shot_direction * 9)
		elif object.has_method("hit"):
			object.hit(36, -player.camera.global_basis.z * 9)
		flash(hit.position, Color("ffce84"), 0.08, 0.09)
	var light := OmniLight3D.new()
	player.camera.add_child(light)
	light.position = Vector3(0.2, -0.15, -0.8)
	light.light_color = Color("ffba66")
	light.light_energy = 1.5
	light.omni_range = 4
	get_tree().create_timer(0.045, false).timeout.connect(light.queue_free)

func noise(pos: Vector3, radius: float) -> void:
	if is_instance_valid(dog):
		dog.hear(pos, radius)
	for guard in enemies:
		if is_instance_valid(guard):
			var query := PhysicsRayQueryParameters3D.create(pos + Vector3.UP, guard.global_position + Vector3.UP, 1)
			var occluded := not get_world_3d().direct_space_state.intersect_ray(query).is_empty()
			guard.hear(pos, radius * (0.45 if occluded else 1.0))

func share_contact(sender, point: Vector3) -> void:
	# One-hop local warning; recipients do not rebroadcast reports or get live tracking.
	for guard in enemies:
		if is_instance_valid(guard) and guard != sender and not guard.dead and guard.global_position.distance_to(sender.global_position) <= 18:
			guard.receive_report(point)

func sample_enemy_aim_point() -> Vector3:
	# Guards aim around the torso, then naturally vary across the silhouette.
	# This keeps ordinary bursts from magically converging on the head hitbox.
	var height := world_rng.randf_range(0.40, 1.22)
	if player.crouched:
		height *= 0.72
	var lateral := world_rng.randf_range(-0.26, 0.26)
	return player.global_position + Vector3.UP * height + player.global_basis.x * lateral

func enemy_fire(guard) -> void:
	if state.passage or guard.dead or guard.arm_wounds.y >= 60 or not guard.sees_player():
		return
	guard.shots_fired += 1
	guard.motion.fire()
	guard.weapon_motion.trigger_shot()
	play_tone(70, 0.04, 0.06)
	# A practiced guard settles better, but never becomes a distant hitscan sniper.
	# Triangular jitter approximates a human shot distribution without a hard accuracy lock.
	var origin: Vector3 = guard.global_position + Vector3.UP * 1.5
	var target := sample_enemy_aim_point()
	var aim_direction := (target - origin).normalized()
	var distance := origin.distance_to(target)
	var quality := clampf(guard.aim_time / 2.5, 0.0, 1.0)
	var deviation := (0.42 + distance * 0.018) * lerpf(1.0, 0.86, quality)
	var height: float = 0.82 * (0.72 if player.crouched else 1.0)
	var right := aim_direction.cross(Vector3.UP).normalized()
	if right.length_squared() < 0.01:
		right = Vector3.RIGHT
	var up := right.cross(aim_direction).normalized()
	var jitter_x := (world_rng.randf() + world_rng.randf() + world_rng.randf() - 1.5) * deviation * 1.9
	var jitter_y := (world_rng.randf() + world_rng.randf() + world_rng.randf() - 1.5) * deviation * 1.9
	var shot_direction := (aim_direction + right * (jitter_x / maxf(distance, 1.0)) + up * (jitter_y / maxf(distance, 1.0))).normalized()
	var ray_end := origin + shot_direction * 80.0
	var query := PhysicsRayQueryParameters3D.create(origin, ray_end, 1 | 2 | 4 | 8)
	query.exclude = [guard.get_rid()]
	var hit := get_world_3d().direct_space_state.intersect_ray(query)
	var impact_point: Vector3 = hit.position if not hit.is_empty() else ray_end
	if not hit.is_empty():
		impact_particles(hit.position, hit.normal)
		if hit.collider == player:
			guard.shots_hit += 1
			player.receive_bullet(hit.position, origin)
	# Close cracks make a visible body duck, interrupt aim, and alert nearby guards.
	var player_center: Vector3 = player.global_position + Vector3.UP * height
	var travel := clampf((player_center - origin).dot(shot_direction), 0.0, origin.distance_to(impact_point))
	var closest := origin + shot_direction * travel
	if closest.distance_to(player_center) < 1.35 and (hit.is_empty() or hit.collider != player):
		guard.near_misses += 1
		noise(impact_point, 14.0)
		for other in enemies:
			if is_instance_valid(other) and other != guard and not other.dead and other.global_position.distance_to(impact_point) < 14.0:
				other.suppress(0.45)

func throw_charge() -> void:
	if state.charges <= 0:
		notify("Нет зарядов. Найди припасы")
		return
	state.charges -= 1
	active_charges += 1
	var epoch := world_epoch
	var target: Vector3 = player.camera.global_position - player.camera.global_basis.z * 10
	var hit := ray(10)
	if not hit.is_empty():
		target = hit.position + hit.normal * 0.25
	var marker := Art.box(world, target, Vector3.ONE * 0.2, Art.material(Color("edb770"), "", 1))
	notify("Заряд активирован. Отойди!")
	var marker_ref: WeakRef = weakref(marker)
	get_tree().create_timer(1.8, false).timeout.connect(func():
		if epoch != world_epoch:
			return
		active_charges -= 1
		var live_marker: Node3D = marker_ref.get_ref()
		if live_marker != null:
			live_marker.queue_free()
		explode(target))

func explode(pos: Vector3) -> void:
	noise(pos, 48)
	play_tone(40, 0.3, 0.28)
	var effect := RazlomBlastFX.new()
	world.add_child(effect)
	effect.global_position = pos
	if is_instance_valid(player):
		player.shock_blend = maxf(player.shock_blend, maxf(0, 1 - player.global_position.distance_to(pos) / 18.0) * blast_exposure(pos, player.global_position + Vector3.UP))
	for block in blocks.values().duplicate():
		if is_instance_valid(block):
			var offset: Vector3 = block.global_position - pos
			if offset.length() < 4:
				block.hit(200 * (1 - offset.length() / 5) * blast_exposure(pos, block.global_position, block), offset.normalized() * 18)
	for guard in enemies:
		if is_instance_valid(guard) and guard.global_position.distance_to(pos) < 5:
			guard.hit(160 * (1 - guard.global_position.distance_to(pos) / 6) * blast_exposure(pos, guard.global_position + Vector3.UP))
	var distance: float = player.global_position.distance_to(pos)
	if distance < 5:
		state.health = maxf(0, state.health - 100 * (1 - distance / 5) * blast_exposure(pos, player.global_position + Vector3.UP))

func flash(pos: Vector3, color: Color, size: float, duration: float) -> void:
	var node := Art.box(world, pos, Vector3.ONE * size, Art.material(color, "", 1.5))
	var tween := node.create_tween()
	tween.tween_property(node, "scale", Vector3.ONE * 0.05, duration)
	tween.tween_callback(node.queue_free)

func interact() -> void:
	var hit := ray(3.2)
	if interactions.try_interact(hit):
		return
	if not hit.is_empty() and hit.collider.has_meta("loot"):
		var item: Node3D = hit.collider
		var kind: String = item.get_meta("loot")
		match kind:
			"rifle":
				state.rifle_owned = true
				state.ammo = maxi(state.ammo, 18)
				player.sync_weapon_state()
			"pump":
				state.pump = true
			"record":
				state.manifest = true
				interactions.read_manifest()
			"food":
				state.food += 1
			"water":
				state.bottles += 1
			"medkit":
				state.medkits += 1
			"armor":
				state.armor = 100
			"helmet":
				state.helmet = 100
			"ammo":
				state.reserve += 18
			"scrap":
				state.scrap += 3
		collected.append(item.get_meta("id"))
		notify(item.get_meta("title"))
		item.queue_free()
		play_tone(490, 0.1, 0.07)
		return
	if is_sheltered(player.global_position):
		if state.pump and not state.complete:
			complete_mission()
		else:
			interactions.bench_dialog()

func complete_mission() -> void:
	if not state.pump or state.complete or not is_sheltered(player.global_position):
		return
	state.complete = true
	state.food += 2
	state.bottles += 2
	notify("Вера: «Вода пошла. Значит, утро у нас будет». Глава завершена")
	var checkpoint := save_game()
	show_menu("ВОДА ВЕРНУЛАСЬ", "ГЛАВА 01 ЗАВЕРШЕНА\n\nВера запускает насос. Впервые за много дней вода не пахнет железом.\n«Ты вернулся. Это важнее, чем ты думаешь».\n\nПрипасы: +2 еды, +2 воды.\n" + ("Прогресс сохранён в убежище." if checkpoint else "Автосохранение пока недоступно. Сохранись в убежище, когда стихнет тревога.") + "\n\n" + ("Накладная обнародована. Жители узнают, кто перекрыл воду; Вера всё ещё надеется найти брата." if state.truth_shared else ("Подпись Ильи осталась между тобой и Верой. Правда может расколоть убежище, но молчание тоже имеет цену." if state.manifest else "На складе осталась накладная. Вера просит узнать, почему насос так и не дошёл до Очага.")) + "\n\n" + ("Павел сдержал слово: насос вернулся без нового боя. Его рассказ об аварийной сирене даёт Вере первую зацепку." if state.passage else "") + "\n\nМожно продолжить исследование. Следующие главы ещё в разработке.")

func is_sheltered(pos: Vector3) -> bool:
	return absf(pos.x + 23) < 4.8 and pos.z > 17.5 and pos.z < 26.5 and pos.y < 3.5

func safe_to_rest() -> bool:
	if not is_sheltered(player.global_position) or active_charges > 0:
		return false
	for guard in enemies:
		if is_instance_valid(guard) and guard.alert:
			return false
	return true

func setup_audio() -> void:
	music = AudioStreamPlayer.new()
	music.name = "RubezhMusic"
	var track: AudioStreamWAV = load("res://assets/audio/rubezh.wav").duplicate()
	track.loop_mode = AudioStreamWAV.LOOP_FORWARD
	track.loop_begin = 0
	track.loop_end = int(track.get_length() * track.mix_rate)
	music.stream = track
	music.volume_db = -18
	add_child(music)
	if DisplayServer.get_name() == "headless":
		return
	music.play()
	shot_sound = AudioStreamPlayer.new()
	var stream := AudioStreamGenerator.new()
	stream.mix_rate = 22050
	stream.buffer_length = 0.4
	shot_sound.stream = stream
	add_child(shot_sound)
	shot_sound.play()
	sound_playback = shot_sound.get_stream_playback()

func play_tone(hz: float, duration: float, volume: float) -> void:
	if sound_playback == null:
		return
	var count := mini(int(duration * 22050), sound_playback.get_frames_available())
	for i in range(count):
		var progress := float(i) / maxf(count, 1)
		var wave := sin(float(i) * hz * TAU / 22050) * 0.4 + audio_rng.randf_range(-0.6, 0.6)
		var sample := wave * (1 - progress) * volume
		sound_playback.push_frame(Vector2(sample, sample))

func notify(text: String) -> void:
	if is_instance_valid(message_label):
		message_label.text = text
	message_time = 6

func ui_label(text: String, size: int, color: Color = Color("e9e6cf")) -> Label:
	var label := Label.new()
	label.text = text
	label.add_theme_font_size_override("font_size", size)
	label.add_theme_color_override("font_color", color)
	return label

func panel_style() -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.035, 0.08, 0.075, 0.94)
	style.border_color = Color("597b6c")
	style.set_border_width_all(1)
	style.content_margin_left = 22
	style.content_margin_right = 22
	style.content_margin_top = 18
	style.content_margin_bottom = 18
	return style

func setup_hud() -> void:
	hud = CanvasLayer.new()
	add_child(hud)
	var root := Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hud.add_child(root)
	combat_feedback = RazlomCombatFeedback.new()
	root.add_child(combat_feedback)
	var brand := ui_label("Р А З Л О М   /   Р У Б Е Ж", 24)
	brand.position = Vector2(36, 28)
	root.add_child(brand)
	clock_label = ui_label("", 12, Color("b0baa2"))
	clock_label.position = Vector2(37, 62)
	root.add_child(clock_label)
	var mission_panel := PanelContainer.new()
	mission_panel.set_anchors_and_offsets_preset(Control.PRESET_TOP_RIGHT)
	mission_panel.position = Vector2(-358, 28)
	mission_panel.custom_minimum_size = Vector2(322, 110)
	mission_panel.add_theme_stylebox_override("panel", panel_style())
	root.add_child(mission_panel)
	mission_label = ui_label("", 17)
	mission_panel.add_child(mission_label)
	aim_reticle = Control.new()
	aim_reticle.name = "AimReticle"
	aim_reticle.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	aim_reticle.offset_left = -18
	aim_reticle.offset_right = 18
	aim_reticle.offset_top = -18
	aim_reticle.offset_bottom = 18
	aim_reticle.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(aim_reticle)
	for segment in [Vector4(17, 2, 2, 9), Vector4(17, 25, 2, 9), Vector4(2, 17, 9, 2), Vector4(25, 17, 9, 2), Vector4(16, 16, 4, 4)]:
		var outline := ColorRect.new()
		outline.position = Vector2(segment.x - 1, segment.y - 1)
		outline.size = Vector2(segment.z + 2, segment.w + 2)
		outline.color = Color(0.01, 0.035, 0.03, 0.9)
		outline.mouse_filter = Control.MOUSE_FILTER_IGNORE
		aim_reticle.add_child(outline)
		var line := ColorRect.new()
		line.position = Vector2(segment.x, segment.y)
		line.size = Vector2(segment.z, segment.w)
		line.color = Color("c8dda9")
		line.mouse_filter = Control.MOUSE_FILTER_IGNORE
		aim_reticle.add_child(line)
	aim_reticle.hide()
	stats_label = ui_label("", 18)
	stats_label.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_LEFT)
	stats_label.position = Vector2(36, -108)
	root.add_child(stats_label)
	hint_label = ui_label("", 16, Color("f3d49a"))
	hint_label.set_anchors_and_offsets_preset(Control.PRESET_CENTER_BOTTOM)
	hint_label.position = Vector2(-220, -153)
	root.add_child(hint_label)
	message_label = ui_label("", 17, Color("e4d19e"))
	message_label.set_anchors_and_offsets_preset(Control.PRESET_CENTER_BOTTOM)
	message_label.position = Vector2(-340, -199)
	root.add_child(message_label)
	for readable in [stats_label, hint_label, message_label]:
		readable.add_theme_color_override("font_outline_color", Color(0.01, 0.025, 0.02, 0.95))
		readable.add_theme_constant_override("outline_size", 5)
	var hint_style := StyleBoxFlat.new()
	hint_style.bg_color = Color(0.02, 0.055, 0.045, 0.92)
	hint_style.content_margin_left = 10
	hint_style.content_margin_right = 10
	hint_style.content_margin_top = 6
	hint_style.content_margin_bottom = 6
	hint_label.add_theme_stylebox_override("normal", hint_style)
	var controls := ui_label("WASD ДВИЖЕНИЕ  ·  ЛКМ ОГОНЬ  ·  ПКМ ПРИЦЕЛ ВКЛ/ВЫКЛ  ·  E ВЗЯТЬ  ·  R ПЕРЕЗАРЯДКА  ·  ESC МЕНЮ", 12, Color("a5b6a5"))
	controls.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_LEFT)
	controls.position = Vector2(36, -32)
	root.add_child(controls)
	modal = PanelContainer.new()
	var column := menu_style.setup(root, modal)
	var eyebrow := ui_label("ТИХОЕ МЕСТО  /  РУБЕЖ", 12)
	menu_style.label(eyebrow, 12, Color("718269"))
	column.add_child(eyebrow)
	modal_title = ui_label("РАЗЛОМ", 48)
	column.add_child(modal_title)
	modal_body = ui_label("", 17)
	modal_body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	modal_body.custom_minimum_size = Vector2(0, 140)
	column.add_child(modal_body)
	start_button = Button.new()
	start_button.text = "НАЧАТЬ ВЫЛАЗКУ"
	start_button.custom_minimum_size.y = 46
	start_button.pressed.connect(resume)
	column.add_child(start_button)
	resume_button = Button.new()
	resume_button.text = "Вернуться к сохранению"
	resume_button.pressed.connect(load_game)
	column.add_child(resume_button)
	save_button = Button.new()
	save_button.text = "Сохранить в убежище"
	save_button.pressed.connect(save_game)
	column.add_child(save_button)
	var quality_button := Button.new()
	quality_button.text = "Графика · тени и дальность"
	quality_button.pressed.connect(toggle_quality)
	column.add_child(quality_button)
	var music_button := Button.new()
	music_button.text = "Тихая музыка · вкл / выкл"
	music_button.pressed.connect(toggle_music)
	column.add_child(music_button)
	var sensitivity_button := Button.new()
	sensitivity_button.text = "Обзор · чувствительность: обычная"
	sensitivity_button.pressed.connect(func():
		sensitivity_step = (sensitivity_step + 1) % 3
		look_scale = [0.65, 1.0, 1.4][sensitivity_step]
		sensitivity_button.text = "Обзор · чувствительность: " + ["низкая", "обычная", "высокая"][sensitivity_step])
	column.add_child(sensitivity_button)
	menu_style.button(sensitivity_button, false)
	var tips := ui_label("H — лечение   •   1 — еда   •   2 — вода   •   F5 / F9 — сохранить / загрузить\nПКМ — прицел вкл/выкл   •   Shift — бег   •   Space — прыжок   •   C — присесть   •   F — фонарь   •   F2 — FPS", 13, Color("a8bca6"))
	column.add_child(tips)
	menu_style.label(modal_title, 46)
	menu_style.label(modal_body, 17, Color("5a6c60"))
	menu_style.label(tips, 12, Color("718269"))
	var kindness := ui_label("Выдохни. Здесь можно немного побыть в тишине.", 14)
	menu_style.label(kindness, 14, Color("718269"))
	column.add_child(kindness)
	for item in [start_button, resume_button, save_button, quality_button, music_button]:
		menu_style.button(item, item == start_button)
	interactions.setup_ui(root)
	if mobile_mode:
		brand.add_theme_font_size_override("font_size", 18)
		brand.position = Vector2(16, 12)
		clock_label.position = Vector2(16, 42)
		clock_label.add_theme_font_size_override("font_size", 11)
		stats_label.set_anchors_and_offsets_preset(Control.PRESET_TOP_LEFT)
		stats_label.position = Vector2(16, 65)
		stats_label.add_theme_font_size_override("font_size", 12)
		mission_panel.set_anchors_and_offsets_preset(Control.PRESET_TOP_LEFT)
		mission_panel.position = Vector2(12, 110)
		mission_panel.custom_minimum_size = Vector2(260, 76)
		mission_panel.size = Vector2(260, 76)
		var compact_style := panel_style()
		compact_style.content_margin_left = 12
		compact_style.content_margin_right = 12
		compact_style.content_margin_top = 10
		compact_style.content_margin_bottom = 10
		mission_panel.add_theme_stylebox_override("panel", compact_style)
		mission_label.add_theme_font_size_override("font_size", 13)
		controls.hide()
		message_label.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
		message_label.offset_left = -150
		message_label.offset_right = 150
		message_label.offset_top = -80
		message_label.offset_bottom = 10
		message_label.custom_minimum_size.x = 300
		message_label.size = Vector2(300, 90)
		message_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		message_label.add_theme_font_size_override("font_size", 13)
		hint_label.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
		hint_label.offset_left = -150
		hint_label.offset_right = 150
		hint_label.offset_top = 32
		hint_label.offset_bottom = 80
		hint_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		hint_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		for label in [brand, clock_label, stats_label, hint_label, message_label]:
			label.add_theme_color_override("font_outline_color", Color(0.01, 0.04, 0.02, 0.85))
			label.add_theme_constant_override("outline_size", 3)
		touch_ui = RazlomTouchControls.new()
		touch_ui.game = self
		root.add_child(touch_ui)

func show_menu(title: String, body: String) -> void:
	get_tree().paused = true
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	modal_title.text = title
	modal_body.text = body
	resume_button.disabled = not FileAccess.file_exists(save_path)
	save_button.disabled = not started or ended
	start_button.text = "Попробовать ещё раз" if ended else ("Вернуться в мир" if started else "Начать путь")
	menu_style.open()
	start_button.grab_focus()

func resume() -> void:
	if ended:
		get_tree().paused = false
		get_tree().reload_current_scene()
		return
	started = true
	menu_style.close()
	interactions.panel.hide()
	get_tree().paused = false
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE if mobile_mode else Input.MOUSE_MODE_CAPTURED

func toggle_music() -> void:
	music_enabled = not music_enabled
	music.volume_db = -18 if music_enabled else -80
	music.stream_paused = not music_enabled
	notify("Музыка включена" if music_enabled else "Музыка выключена")

func toggle_quality() -> void:
	low_quality = not low_quality
	get_node("Sun").shadow_enabled = not low_quality
	player.camera.far = 90 if low_quality else 180
	notify("Низкое качество" if low_quality else "Стандартное качество")

func _input(event: InputEvent) -> void:
	if mobile_mode and interactions != null:
		interactions.handle_touch(event)
	if event is InputEventKey and event.pressed and not event.echo:
		if event.keycode == KEY_ESCAPE and started and not ended:
			if get_tree().paused:
				resume()
			else:
				show_menu("ПЕРЕДЫШКА", "Город подождёт.\n\nНасосный блок лежит в складе с зелёной крышей.\nОхрана реагирует на видимость и шум.\nКирпичные стены разрушаются, стальная рама остаётся.\n\nСохраниться можно в убежище после затихания боя.")
		if event.keycode == KEY_F5 and started and not ended:
			save_game()
		if event.keycode == KEY_F9:
			load_game()
		if event.keycode == KEY_TAB and started and not ended and not get_tree().paused:
			interactions.inventory()
		if event.keycode == KEY_M:
			toggle_music()
		if event.keycode == KEY_F2:
			DisplayServer.window_set_title("РАЗЛОМ / FPS %d / debris %d / blocks %d" % [Engine.get_frames_per_second(), active_debris, blocks.size()])

func _process(delta: float) -> void:
	refresh_world_state()
	# Read-only browser diagnostics: no RPC or mutable RatCore geometry is shared.
	if OS.has_feature("web"):
		web_report_time -= delta
		if web_report_time <= 0 and is_instance_valid(player):
			web_report_time = 0.25
			var bridge = Engine.get_singleton("JavaScriptBridge")
			bridge.eval("window.__razlomStatus = " + JSON.stringify({
				"ready": true, "started": started, "paused": get_tree().paused,
				"dialog": interactions.diagnostics(),
				"quests": state.quests, "trackedQuest": state.tracked_quest,
				"blastCount": get_tree().get_nodes_in_group("blast_fx").size(), "activeCharges": active_charges,
				"touch": touch_ui.diagnostics() if is_instance_valid(touch_ui) else {},
				"startButton": [start_button.global_position.x, start_button.global_position.y, start_button.size.x, start_button.size.y],
				"mobile": mobile_mode, "ammo": state.ammo, "rifleOwned": state.rifle_owned, "aiming": player.aiming, "yaw": player.rotation.y,
				"weapon": {"motion": player.motion_state, "phase": player.weapon_motion.phase, "reload": player.reload_time, "magazineY": player.weapon_motion.magazine.position.y, "handY": player.weapon_motion.support_hand.position.y},
				"view": [get_viewport().get_visible_rect().size.x, get_viewport().get_visible_rect().size.y],
				"health": state.health, "pump": state.pump, "complete": state.complete,
				"position": [player.position.x, player.position.y, player.position.z],
				"saveExists": FileAccess.file_exists(save_path),
				"saveButton": [save_button.global_position.x, save_button.global_position.y,
					save_button.size.x, save_button.size.y],
				"loadButton": [resume_button.global_position.x, resume_button.global_position.y,
					resume_button.size.x, resume_button.size.y],
				"menuRect": [modal.position.x, modal.size.x]}))
	if ended and death_age >= 0 and not get_tree().paused:
		death_age += delta
		if death_age >= 1.0:
			death_age = -1
			finish_death_menu()
	if not is_instance_valid(stats_label):
		return
	var weapon_status := "МАГАЗИН %02d / %02d" % [state.ammo, state.reserve] if state.rifle_owned else "ВИНТОВКА: НЕТ • E У СТЕНЫ"
	stats_label.text = "ЗДОРОВЬЕ %03d     ВОДА %03d     ЕДА %03d     СИЛЫ %03d\n%s     ЗАРЯДЫ %d     АПТЕЧКИ %d     ДЕТАЛИ %d" % [state.health, state.water, state.hunger, state.stamina, weapon_status, state.charges, state.medkits, state.scrap]
	if mobile_mode:
		stats_label.text = "ЗДОРОВЬЕ %d  ВОДА %d  ЕДА %d\n%s  АПТЕЧКИ %d" % [state.health, state.water, state.hunger, ("ПАТРОНЫ %d/%d" % [state.ammo, state.reserve] if state.rifle_owned else "ВИНТОВКА: НЕТ"), state.medkits]
	if is_instance_valid(aim_reticle):
		aim_reticle.visible = started and not ended and not get_tree().paused and state.rifle_owned and player.aiming
	stats_label.text += "\nБРОНЯ %d  ШЛЕМ %d  БОЛЬ %d" % [state.armor, state.helmet, state.pain]
	clock_label.text = "РЕГИОН РУБЕЖ   /   %02d:%02d   /   ТЕПЛО %03d   УСТАЛОСТЬ %03d" % [int(day_minutes / 60) % 24, int(day_minutes) % 60, state.warmth, state.fatigue]
	if mobile_mode:
		clock_label.text = "%02d:%02d  ТЕПЛО %d  УСТАЛОСТЬ %d" % [int(day_minutes / 60) % 24, int(day_minutes) % 60, state.warmth, state.fatigue]
	var destination := Vector3(-23, 0, 22) if state.pump else Vector3(21, 0, -20)
	if state.complete and not state.relay_log:
		destination = Vector3(68, 0, 22)
	var tracking := quests.tracking()
	if not tracking.is_empty():
		destination = tracking.target
	var offset: Vector3 = destination - player.global_position
	var distance := Vector2(offset.x, offset.z).length()
	var local_target: Vector3 = player.global_transform.basis.inverse() * offset
	var bearing := atan2(local_target.x, -local_target.z)
	var direction_text := "ПРЯМО" if absf(bearing) < 0.35 else ("РАЗВЕРНИСЬ" if absf(bearing) > 2.5 else ("ПОВЕРНИ НАПРАВО" if bearing > 0 else "ПОВЕРНИ НАЛЕВО"))
	mission_label.text = "01 / ТЁПЛАЯ СТЕНА\n" + ("Вода восстановлена\nЗадание завершено" if state.complete else (("Убежище" if state.pump else "Насос · склад 03") + " · %d м\n" % int(distance) + direction_text))
	if state.complete and not state.relay_shared:
		mission_label.text = "02 / ГОЛОС В ЭФИРЕ\n" + ("Вера • убежище" if state.relay_log else "Ретранслятор 12") + " · %d м\n" % int(distance) + direction_text
	if not tracking.is_empty():
		mission_label.text = str(tracking.title) + "\nЦель · %d м\n" % int(distance) + direction_text
	if get_tree().paused or ended:
		return
	quests.advance(delta)
	interactions.advance_people(delta)
	elapsed += delta
	day_minutes += delta * 0.2
	var hour := fmod(day_minutes / 60.0, 24.0)
	var sun: DirectionalLight3D = get_node("Sun")
	sun.rotation_degrees.x = -(hour - 6) * 15
	var daylight := clampf(sin((hour - 6) * PI / 12), 0, 1)
	sun.light_energy = maxf(0.04, daylight * 1.8)
	ambience.environment.ambient_light_energy = 0.13 + daylight * 0.52
	var sky_material: ProceduralSkyMaterial = ambience.environment.sky.sky_material
	sky_material.sky_top_color = Color("0b1827").lerp(Color("335f68"), daylight)
	sky_material.sky_horizon_color = Color("253a46").lerp(Color("c4c1a3"), daylight)
	if nav_dirty:
		refresh_navigation()
		nav_dirty = false
	message_time = maxf(0, message_time - delta)
	message_label.visible = message_time > 0
	hint_label.text = ""
	var hit := ray(3.2)
	if not hit.is_empty() and hit.collider.has_meta("loot"):
		hint_label.text = ("ВЗЯТЬ  /  " if mobile_mode else "E  /  ") + str(hit.collider.get_meta("title"))
	elif not hit.is_empty() and hit.collider.has_meta("use"):
		hint_label.text = ("ВЗЯТЬ  /  " if mobile_mode else "E  /  ") + str(hit.collider.get_meta("title"))
	elif is_sheltered(player.global_position):
		hint_label.text = ("ВЗЯТЬ  /  " if mobile_mode else "E  /  ") + ("Установить насос" if state.pump and not state.complete else "Убежище · верстак")
	hint_label.visible = not hint_label.text.is_empty()
	if state.health <= 0 or player.position.y < -12:
		ended = true
		death_age = 0
		spawn_corpse(player.global_position, player.rotation.y, "head" if combat_feedback.injury_text.contains("ГОЛОВА") else "torso", true)
		player.begin_death()

func finish_death_menu() -> void:
	show_menu("ВЫЛАЗКА ОКОНЧЕНА", "Рубеж ошибок не прощает.\n" + combat_feedback.injury_text + "\nБез шлема и бронежилета попадание в жизненно важную зону смертельно.\n\nЗагрузи сохранение или начни заново.\nИспользуй укрытия и аптечки. Отходи от зарядов.\n\nПотери не означают конец истории.")

func save_game() -> bool:
	if not started or ended:
		return false
	if player.global_position.distance_to(Vector3(-23, 0, 22)) > 5:
		notify("Сохранение доступно только в убежище")
		return false
	for guard in enemies:
		if is_instance_valid(guard) and guard.alert:
			notify("Нельзя сохранить во время тревоги")
			return false
	if active_charges > 0:
		notify("Сначала дождись завершения взрыва")
		return false
	if active_debris > 0:
		notify("Подожди, пока обломки успокоятся")
		return false
	var data: Dictionary = state.snapshot()
	data["position"] = [player.position.x, player.position.y, player.position.z]
	data["yaw"] = player.rotation.y
	data["day_minutes"] = day_minutes
	data["local_damage"] = {}
	for id in blocks:
		if not blocks[id].removed.is_empty():
			data.local_damage[id] = blocks[id].removed.keys()
	data["destroyed"] = destroyed.duplicate()
	data["collected"] = collected.duplicate()
	data["defeated"] = defeated.duplicate()
	data["loot"] = []
	for item in get_tree().get_nodes_in_group("loot"):
		if item.is_queued_for_deletion():
			continue
		data["loot"].append({"kind": item.get_meta("loot"), "title": item.get_meta("title"), "id": item.get_meta("id"), "position": [item.position.x, item.position.y, item.position.z]})
	data["dog"] = dog.snapshot() if is_instance_valid(dog) and not dog.is_queued_for_deletion() else {"present": false}
	data["corpses"] = []
	for body in get_tree().get_nodes_in_group("corpses"):
		if not body.is_queued_for_deletion(): data.corpses.append(body.snapshot())
	data["rubble"] = []
	for piece in get_tree().get_nodes_in_group("rubble"):
		if not piece.is_queued_for_deletion():
			data["rubble"].append({"position": [piece.position.x, piece.position.y, piece.position.z], "rotation": [piece.rotation.x, piece.rotation.y, piece.rotation.z]})
	data["guards"] = []
	for guard in enemies:
		if is_instance_valid(guard) and not guard.is_queued_for_deletion():
			data["guards"].append({"id": String(guard.name), "health": guard.health, "position": [guard.position.x, guard.position.y, guard.position.z], "memory": guard.awareness.snapshot(), "leg_wound": guard.leg_wound, "arm_wounds": [guard.arm_wounds.x, guard.arm_wounds.y]})
	var file := FileAccess.open(save_path + ".tmp", FileAccess.WRITE)
	if file == null:
		notify("Не удалось записать сохранение")
		return false
	file.store_string(JSON.stringify(data))
	file.flush()
	var write_error := file.get_error()
	file.close()
	if write_error != OK:
		notify("Не удалось полностью записать сохранение")
		return false
	if FileAccess.file_exists(save_path):
		if DirAccess.copy_absolute(save_path, save_path + ".bak") != OK:
			notify("Не удалось создать резервную копию; старый сейв сохранён")
			return false
	var error := DirAccess.rename_absolute(save_path + ".tmp", save_path)
	notify("Прогресс сохранён" if error == OK else "Ошибка сохранения: старая копия не изменена")

	return error == OK

func load_game() -> bool:
	if not FileAccess.file_exists(save_path):
		notify("Сохранений пока нет")
		return false
	var data = JSON.parse_string(FileAccess.get_file_as_string(save_path))
	var restored = StateScript.new()
	if not data is Dictionary or not restored.restore(data):
		notify("Неподдерживаемое или повреждённое сохранение")
		return false
	if not data.get("position") is Array or data.position.size() != 3:
		notify("Повреждены координаты сохранения")
		return false
	for value in data.position:
		if not (value is float or value is int) or not is_finite(float(value)) or absf(float(value)) > 64:
			notify("Недопустимые координаты сохранения")
			return false
	for key in ["destroyed", "collected", "defeated"]:
		if not data.get(key) is Array:
			notify("Повреждён список объектов")
			return false
		for value in data[key]:
			if not value is String:
				notify("Повреждены идентификаторы объектов")
				return false
	if not (data.get("yaw") is float or data.get("yaw") is int) or not is_finite(float(data.yaw)):
		return false
	if not validate_world_save(data):
		notify("Повреждено состояние мира")
		return false
	# Rebuild from seed before applying snapshot: loading must also restore objects
	# destroyed or collected AFTER the checkpoint, not just delete more objects.
	world_epoch += 1
	active_charges = 0
	world.free()
	blocks.clear()
	enemies.clear()
	active_debris = 0
	loot_index = 0
	world_rng.seed = 7301
	world = Node3D.new()
	world.process_mode = Node.PROCESS_MODE_PAUSABLE
	add_child(world)
	build_level()
	state = restored
	player.sync_weapon_state()
	day_minutes = float(data.get("day_minutes", 462.0))
	destroyed = data.destroyed.duplicate()
	collected = data.collected.duplicate()
	defeated = data.defeated.duplicate()
	for id in blocks.keys():
		if destroyed.has(id):
			blocks[id].queue_free()
			blocks.erase(id)
	for id in data.get("local_damage", {}):
		if blocks.has(id):
			for cell in data.local_damage[id]:
				blocks[id].removed[int(cell)] = true
			blocks[id].rebuild_damage()
	for item in get_tree().get_nodes_in_group("loot"):
		item.free()
	for record in data.loot:
		spawn_loot(record.kind, Vector3(record.position[0], record.position[1], record.position[2]), record.title, record.id)
	for guard in enemies:
		if is_instance_valid(guard):
			var found := false
			for record in data.guards:
				if record.id == String(guard.name):
					found = true
					guard.awareness.restore(record.get("memory", []))
					guard.health = float(record.health)
					guard.leg_wound = record.get("leg_wound", false)
					var wounds: Array = record.get("arm_wounds", [0, 0])
					guard.arm_wounds = Vector2(wounds[0], wounds[1])
					guard.position = Vector3(record.position[0], record.position[1], record.position[2])
			if not found:
				guard.queue_free()
	if data.has("dog"):
		if data.dog.present:
			dog.restore(data.dog)
		else:
			dog.queue_free()
	for body in data.get("corpses", []):
		spawn_corpse(Vector3(body.position[0], body.position[1], body.position[2]), body.yaw, body.zone, body.player, null, true)
	for piece in data.get("rubble", []):
		spawn_settled_rubble(Vector3(piece.position[0], piece.position[1], piece.position[2]), Vector3(piece.rotation[0], piece.rotation[1], piece.rotation[2]))
	refresh_navigation()
	player.position = Vector3(data.position[0], data.position[1], data.position[2])
	player.rotation.y = float(data.yaw)
	player.velocity = Vector3.ZERO
	player.reload_time = 0
	player.healing_time = 0
	player.last_health = state.health
	combat_feedback.pain = state.pain
	combat_feedback.injury_time = 0
	combat_feedback.hurt_time = 0
	player.set_crouched(false)
	player.reset_death_pose()
	death_age = -1
	quests.scan_time = 0
	player.shot_bloom = 0
	player.shock_blend = 0
	ended = false
	resume()
	notify("Сохранение загружено")

	return true

func validate_world_save(data: Dictionary) -> bool:
	if not RazlomCorpse.valid(data.get("corpses", [])): return false
	var local_damage = data.get("local_damage", {})
	if not local_damage is Dictionary or local_damage.size() > 32:
		return false
	for id in local_damage:
		if not id is String or id.length() > 64 or not local_damage[id] is Array or local_damage[id].size() > 512:
			return false
		var seen: Dictionary = {}
		for cell in local_damage[id]:
			if not (cell is int or cell is float) or not is_finite(float(cell)) or float(cell) != floor(float(cell)) or cell < 0 or cell >= 512 or seen.has(int(cell)):
				return false
			seen[int(cell)] = true
	if not validate_dog_save(data.get("dog", {"present": false})):
		return false
	if not (data.get("day_minutes", 462.0) is float or data.get("day_minutes", 462.0) is int):
		return false
	if not is_finite(float(data.get("day_minutes", 462.0))):
		return false
	if not data.get("loot") is Array or not data.get("guards") is Array:
		return false
	if data.loot.size() > 100 or data.guards.size() > 3:
		return false
	if not data.get("rubble", []) is Array or data.get("rubble", []).size() > 256:
		return false
	for piece in data.get("rubble", []):
		if not piece is Dictionary:
			return false
		for key in ["position", "rotation"]:
			if not piece.get(key) is Array or piece[key].size() != 3:
				return false
			for value in piece[key]:
				if not (value is float or value is int) or not is_finite(float(value)) or absf(float(value)) > 128:
					return false
	for record in data.loot + data.guards:
		if not record is Dictionary or not record.get("id") is String:
			return false
		if not record.get("position") is Array or record.position.size() != 3:
			return false
		for value in record.position:
			if not (value is float or value is int) or not is_finite(float(value)) or absf(float(value)) > 128:
				return false
	for record in data.loot:
		if not record.get("kind") in ["pump", "food", "water", "medkit", "ammo", "scrap", "record", "armor", "helmet", "rifle"] or not record.get("title") is String:
			return false
	for record in data.guards:
		var wounds: Variant = record.get("arm_wounds", [0, 0])
		if not wounds is Array or wounds.size() != 2: return false
		for wound in wounds:
			if not (wound is int or wound is float) or not is_finite(float(wound)) or wound < 0 or wound > 100: return false
		if not record.get("leg_wound", false) is bool:
			return false
		if not RazlomAIMemory.valid(record.get("memory", [])):
			return false
		if not (record.get("health") is float or record.get("health") is int):
			return false
		if not is_finite(float(record.health)) or float(record.health) < 0 or float(record.health) > 100:
			return false
	return true

func refresh_navigation() -> void:
	navigation = AStarGrid2D.new()
	navigation.region = Rect2i(-84, -84, 169, 169)
	navigation.cell_size = Vector2.ONE
	navigation.diagonal_mode = AStarGrid2D.DIAGONAL_MODE_NEVER
	navigation.update()
	mark_navigation(world)

func mark_navigation(parent: Node) -> void:
	for child in parent.get_children():
		if child.is_queued_for_deletion():
			continue
		if child is StaticBody3D or (child is RigidBody3D and child.freeze):
			for part in child.get_children():
				if part is CollisionShape3D and part.shape is BoxShape3D:
					var center: Vector3 = part.global_position
					var half: Vector3 = part.shape.size * 0.5
					if center.y + half.y < 0.3 or center.y - half.y > 1.7:
						continue
					for x in range(ceili(center.x - half.x - 0.25), floori(center.x + half.x + 0.25) + 1):
						for z in range(ceili(center.z - half.z - 0.25), floori(center.z + half.z + 0.25) + 1):
							if navigation.is_in_boundsv(Vector2i(x, z)):
								navigation.set_point_solid(Vector2i(x, z))
		mark_navigation(child)

func open_cell(point: Vector2i) -> Vector2i:
	for radius in range(5):
		for x in range(-radius, radius + 1):
			for y in range(-radius, radius + 1):
				var cell := point + Vector2i(x, y)
				if navigation.is_in_boundsv(cell) and not navigation.is_point_solid(cell):
					return cell
	return Vector2i(0, 0)

func next_waypoint(from: Vector3, target: Vector3) -> Vector3:
	var start := open_cell(Vector2i(roundi(from.x), roundi(from.z)))
	var finish := open_cell(Vector2i(roundi(target.x), roundi(target.z)))
	var path := navigation.get_id_path(start, finish)
	if path.size() > 1:
		return Vector3(path[1].x, from.y, path[1].y)
	return from

func blast_exposure(origin: Vector3, target: Vector3, expected: Object = null) -> float:
	var query := PhysicsRayQueryParameters3D.create(origin, target, 1)
	var hit := get_world_3d().direct_space_state.intersect_ray(query)
	return 1.0 if hit.is_empty() or hit.collider == expected else 0.15

func spawn_settled_rubble(pos: Vector3, rot: Vector3) -> void:
	var body := Art.box(world, pos, Vector3.ONE * 0.78, Art.material(Color.WHITE, "brick"), true)
	body.rotation = rot
	body.add_to_group("rubble")

func validate_dog_save(data: Variant) -> bool:
	if not data is Dictionary or not data.get("present") is bool:
		return false
	if not data.present:
		return true
	for key in ["health", "trust"]:
		if not (data.get(key) is float or data.get(key) is int) or not is_finite(float(data[key])):
			return false
	if data.health < 0 or data.health > 60 or data.trust < 0 or data.trust > 2 or float(data.trust) != floor(float(data.trust)):
		return false
	if not data.get("following") is bool or not data.get("waiting") is bool:
		return false
	if not data.get("position") is Array or data.position.size() != 3:
		return false
	for value in data.position:
		if not (value is float or value is int) or not is_finite(float(value)) or absf(float(value)) > 128:
			return false
	return true

func _exit_tree() -> void:
	if is_instance_valid(shot_sound):
		shot_sound.stop()
		shot_sound.stream = null
	sound_playback = null

func impact_particles(point: Vector3, normal: Vector3) -> void:
	# Four short-lived visual chips; no collision bodies and no persistent decals.
	for i in range(4):
		var chip := Art.box(world, point + normal * 0.04, Vector3(0.025, 0.025, 0.06), Art.material(Color("d5b278")))
		var tangent := normal.cross(Vector3.UP)
		if tangent.length_squared() < 0.01:
			tangent = Vector3.RIGHT
		var end := chip.position + normal * 0.22 + tangent.normalized() * (float(i) - 1.5) * 0.11 + Vector3.UP * (0.08 + i * 0.025)
		var tween := chip.create_tween().set_parallel(true)
		tween.tween_property(chip, "position", end, 0.18)
		tween.tween_property(chip, "scale", Vector3.ONE * 0.05, 0.22)
		tween.chain().tween_callback(chip.queue_free)

func damaged_blocks_count() -> int:
	var total := 0
	for block in blocks.values():
		if not block.removed.is_empty():
			total += 1
	return total

func spawn_corpse(point: Vector3, angle: float, zone: String, player_body: bool = false, model: Node3D = null, instant: bool = false) -> RazlomCorpse:
	var body := RazlomCorpse.new()
	body.game = self
	world.add_child(body)
	body.player_body = player_body
	var query := PhysicsRayQueryParameters3D.create(point + Vector3.UP * 0.4, point + Vector3.DOWN * 4, 1)
	var hit := get_world_3d().direct_space_state.intersect_ray(query)
	body.global_position = (hit.position if not hit.is_empty() else point) + Vector3.UP * 0.23
	if model == null:
		model = Art.humanoid(body)
		RazlomActorMotion.new(model)
		model.get_node("Weapon").hide()
	body.configure(model, angle, zone, instant)
	RazlomBloodFX.pool(world, body.global_position + body.basis.x * 0.6 - Vector3.UP * 0.22)
	return body
