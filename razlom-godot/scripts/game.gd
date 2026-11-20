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
var mobile_mode := false
var touch_ui: RazlomTouchControls
var day_minutes := 462.0
var save_path := "user://razlom-save.json"
var player
var dog
var world: Node3D
var hud: CanvasLayer
var stats_label: Label
var mission_label: Label
var clock_label: Label
var hint_label: Label
var message_label: Label
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
var low_quality := false
var ambience: WorldEnvironment

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	world_rng.seed = 7301
	audio_rng.seed = 8201
	interactions.game = self
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
	show_menu("РАЗЛОМ", "ТЁПЛАЯ СТЕНА  /  ГЛАВА 01\n\nВера: «На станции остался насосный блок.\nСыну Рады осталось воды на одну ночь.\nИ кому-то было приказано не пускать нас на склад».\n\nДоберись до склада, забери блок и вернись к убежищу.\nМожно пройти через ворота или пробить кирпичную стену.")

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
	Art.box(world, Vector3(0, -0.6, 0), Vector3(128, 1, 128), ground, true)
	Art.box(world, Vector3(0, -0.03, 12), Vector3(10, 0.12, 95), Art.material(Color.WHITE, "asphalt"))
	for z in range(-40, 55, 6):
		Art.box(world, Vector3(0, 0.05, z), Vector3(0.16, 0.02, 2), Art.material(Color("b6b38a")))
	# Explicit map boundary: large cliffs with collision, never an invisible wall.
	for i in range(32):
		for side in [-1, 1]:
			var h := world_rng.randf_range(4, 9)
			Art.box(world, Vector3(-62 + i * 4, h * 0.5, side * 61), Vector3(4.2, h, 5), concrete, true)
			Art.box(world, Vector3(side * 61, h * 0.5, -62 + i * 4), Vector3(5, h, 4.2), concrete, true)
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
	Art.box(world, Vector3(-23, 3.7, 22), Vector3(10.8, 0.3, 9.8), metal, true)
	Art.sign_text(world, "ОЧАГ / 07", Vector3(-23, 3.1, 26.9), 62)
	Art.box(world, Vector3(-25, 0.5, 19), Vector3(2.1, 0.8, 1), wood, true)
	Art.box(world, Vector3(-25, 0.98, 19), Vector3(2, 0.15, 0.9), Art.material(Color("aaa07c")))
	Art.box(world, Vector3(-20, 0.65, 19), Vector3(2, 1.3, 0.8), metal, true)
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
	spawn_loot("medkit", Vector3(11, 1.4, -20), "Аптечка • +1", "warehouse_med")
	spawn_loot("scrap", Vector3(-10, 1.1, -12), "Детали • +3", "scrap_01")
	spawn_loot("scrap", Vector3(-14, 1.1, 7), "Детали • +3", "scrap_02")
	spawn_loot("scrap", Vector3(30, 1.1, 1), "Детали • +3", "scrap_03")
	for i in range(3):
		var guard = EnemyScript.new()
		guard.name = "guard_%d" % i
		guard.game = self
		guard.process_mode = Node.PROCESS_MODE_PAUSABLE
		guard.position = [Vector3(14, 0.3, -4), Vector3(20, 0.3, -17), Vector3(30, 0.3, -18)][i]
		world.add_child(guard)
		enemies.append(guard)

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
	block.tint = Color.WHITE
	world.add_child(block)
	block.position = pos
	var visual := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	mesh.size = Vector3(0.98, 0.98, 0.98)
	visual.mesh = mesh
	visual.material_override = Art.material(Color.WHITE, "brick")
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
	Art.box(item, Vector3.ZERO, Vector3(0.55, 0.4, 0.4), Art.material(color, "metal"))
	Art.box(item, Vector3(0, 0.24, 0), Vector3(0.28, 0.08, 0.15), Art.material(Color("c7c7a7")))
	var collision := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = Vector3(0.6, 0.5, 0.5)
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
	noise(player.global_position, 24)
	play_tone(95, 0.07, 0.22)
	var hit := ray()
	if not hit.is_empty():
		var object: Object = hit.collider
		if object.has_method("hit"):
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

func enemy_fire(guard) -> void:
	if not guard.sees_player():
		return
	guard.motion.fire()
	play_tone(70, 0.04, 0.06)
	# Explicit prototype accuracy: seeded chance only after actual line of sight.
	if world_rng.randf() < 0.55:
		state.health = maxf(0, state.health - 9)
		notify("Попадание! Найди укрытие • H — аптечка")

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
	flash(pos, Color("ffc26c"), 2.6, 0.3)
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
	show_menu("ВОДА ВЕРНУЛАСЬ", "ГЛАВА 01 ЗАВЕРШЕНА\n\nВера запускает насос. Впервые за много дней вода не пахнет железом.\n«Ты вернулся. Это важнее, чем ты думаешь».\n\nПрипасы: +2 еды, +2 воды.\n" + ("Прогресс сохранён в убежище." if checkpoint else "Автосохранение пока недоступно. Сохранись в убежище, когда стихнет тревога.") + "\n\n" + ("Накладная обнародована. Жители узнают, кто перекрыл воду; Вера всё ещё надеется найти брата." if state.truth_shared else ("Подпись Ильи осталась между тобой и Верой. Правда может расколоть убежище, но молчание тоже имеет цену." if state.manifest else "На складе осталась накладная. Вера просит узнать, почему насос так и не дошёл до Очага.")) + "\n\nМожно продолжить исследование. Следующие главы ещё в разработке.")

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
	var crosshair := ui_label("+", 22, Color("e5d9b5"))
	crosshair.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	crosshair.position = Vector2(-6, -15)
	root.add_child(crosshair)
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
	var controls := ui_label("WASD  ДВИЖЕНИЕ    /    ЛКМ  ОГОНЬ    /    E  ВЗЯТЬ    /    R  МАГАЗИН    /    G  ЗАРЯД    /    ESC  МЕНЮ", 12, Color("a5b6a5"))
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
	var tips := ui_label("H — лечение   •   1 — еда   •   2 — вода   •   F5 / F9 — сохранить / загрузить\nПКМ — прицел   •   Shift — бег   •   Space — прыжок   •   C — присесть   •   F — фонарь   •   F2 — FPS", 13, Color("a8bca6"))
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
		message_label.position = Vector2(-150, -50)
		message_label.custom_minimum_size.x = 300
		message_label.size = Vector2(300, 90)
		message_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		message_label.add_theme_font_size_override("font_size", 13)
		hint_label.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
		hint_label.position = Vector2(-140, 32)
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
	# Read-only browser diagnostics: no RPC or mutable RatCore geometry is shared.
	if OS.has_feature("web"):
		web_report_time -= delta
		if web_report_time <= 0 and is_instance_valid(player):
			web_report_time = 0.25
			var bridge = Engine.get_singleton("JavaScriptBridge")
			bridge.eval("window.__razlomStatus = " + JSON.stringify({
				"ready": true, "started": started, "paused": get_tree().paused,
				"dialog": interactions.diagnostics(),
				"touch": touch_ui.diagnostics() if is_instance_valid(touch_ui) else {},
				"startButton": [start_button.global_position.x, start_button.global_position.y, start_button.size.x, start_button.size.y],
				"mobile": mobile_mode, "ammo": state.ammo, "yaw": player.rotation.y,
				"view": [get_viewport().get_visible_rect().size.x, get_viewport().get_visible_rect().size.y],
				"health": state.health, "pump": state.pump, "complete": state.complete,
				"position": [player.position.x, player.position.y, player.position.z],
				"saveExists": FileAccess.file_exists(save_path),
				"saveButton": [save_button.global_position.x, save_button.global_position.y,
					save_button.size.x, save_button.size.y],
				"loadButton": [resume_button.global_position.x, resume_button.global_position.y,
					resume_button.size.x, resume_button.size.y],
				"menuRect": [modal.position.x, modal.size.x]}))
	if not is_instance_valid(stats_label):
		return
	stats_label.text = "ЗДОРОВЬЕ %03d     ВОДА %03d     ЕДА %03d     СИЛЫ %03d\nМАГАЗИН %02d / %02d     ЗАРЯДЫ %d     АПТЕЧКИ %d     ДЕТАЛИ %d" % [state.health, state.water, state.hunger, state.stamina, state.ammo, state.reserve, state.charges, state.medkits, state.scrap]
	if mobile_mode:
		stats_label.text = "ЗДОРОВЬЕ %d  ВОДА %d  ЕДА %d\nПАТРОНЫ %d/%d  АПТЕЧКИ %d" % [state.health, state.water, state.hunger, state.ammo, state.reserve, state.medkits]
	clock_label.text = "РЕГИОН РУБЕЖ   /   %02d:%02d   /   ТЕПЛО %03d   УСТАЛОСТЬ %03d" % [int(day_minutes / 60) % 24, int(day_minutes) % 60, state.warmth, state.fatigue]
	if mobile_mode:
		clock_label.text = "%02d:%02d  ТЕПЛО %d  УСТАЛОСТЬ %d" % [int(day_minutes / 60) % 24, int(day_minutes) % 60, state.warmth, state.fatigue]
	mission_label.text = "01  /  ТЁПЛАЯ СТЕНА\n" + ("Вода восстановлена\nМожно продолжить исследование" if state.complete else ("Вернись в убежище\nСдай насосный блок • E" if state.pump else "Найди насосный блок\nСклад 03 · северо-восток"))
	if get_tree().paused or ended:
		return
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
		hint_label.text = "E  /  " + str(hit.collider.get_meta("title"))
	elif not hit.is_empty() and hit.collider.has_meta("use"):
		hint_label.text = "E  /  " + str(hit.collider.get_meta("title"))
	elif is_sheltered(player.global_position):
		hint_label.text = "E  /  " + ("Установить насос" if state.pump and not state.complete else "Убежище · верстак")
	if state.health <= 0 or player.position.y < -12:
		ended = true
		show_menu("ВЫЛАЗКА ОКОНЧЕНА", "Рубеж ошибок не прощает.\n\nЗагрузи сохранение или начни заново.\nИспользуй укрытия и аптечки. Отходи от зарядов.\n\nПотери не означают конец истории.")

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
	data["destroyed"] = destroyed.duplicate()
	data["collected"] = collected.duplicate()
	data["defeated"] = defeated.duplicate()
	data["loot"] = []
	for item in get_tree().get_nodes_in_group("loot"):
		if item.is_queued_for_deletion():
			continue
		data["loot"].append({"kind": item.get_meta("loot"), "title": item.get_meta("title"), "id": item.get_meta("id"), "position": [item.position.x, item.position.y, item.position.z]})
	data["dog"] = dog.snapshot() if is_instance_valid(dog) and not dog.is_queued_for_deletion() else {"present": false}
	data["rubble"] = []
	for piece in get_tree().get_nodes_in_group("rubble"):
		if not piece.is_queued_for_deletion():
			data["rubble"].append({"position": [piece.position.x, piece.position.y, piece.position.z], "rotation": [piece.rotation.x, piece.rotation.y, piece.rotation.z]})
	data["guards"] = []
	for guard in enemies:
		if is_instance_valid(guard) and not guard.is_queued_for_deletion():
			data["guards"].append({"id": String(guard.name), "health": guard.health, "position": [guard.position.x, guard.position.y, guard.position.z], "memory": guard.awareness.snapshot()})
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
	day_minutes = float(data.get("day_minutes", 462.0))
	destroyed = data.destroyed.duplicate()
	collected = data.collected.duplicate()
	defeated = data.defeated.duplicate()
	for id in blocks.keys():
		if destroyed.has(id):
			blocks[id].queue_free()
			blocks.erase(id)
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
					guard.position = Vector3(record.position[0], record.position[1], record.position[2])
			if not found:
				guard.queue_free()
	if data.has("dog"):
		if data.dog.present:
			dog.restore(data.dog)
		else:
			dog.queue_free()
	for piece in data.get("rubble", []):
		spawn_settled_rubble(Vector3(piece.position[0], piece.position[1], piece.position[2]), Vector3(piece.rotation[0], piece.rotation[1], piece.rotation[2]))
	refresh_navigation()
	player.position = Vector3(data.position[0], data.position[1], data.position[2])
	player.rotation.y = float(data.yaw)
	player.velocity = Vector3.ZERO
	player.reload_time = 0
	player.set_crouched(false)
	ended = false
	resume()
	notify("Сохранение загружено")

	return true

func validate_world_save(data: Dictionary) -> bool:
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
		if not record.get("kind") in ["pump", "food", "water", "medkit", "ammo", "scrap", "record"] or not record.get("title") is String:
			return false
	for record in data.guards:
		if not RazlomAIMemory.valid(record.get("memory", [])):
			return false
		if not (record.get("health") is float or record.get("health") is int):
			return false
		if not is_finite(float(record.health)) or float(record.health) < 0 or float(record.health) > 100:
			return false
	return true

func refresh_navigation() -> void:
	navigation = AStarGrid2D.new()
	navigation.region = Rect2i(-60, -60, 121, 121)
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
