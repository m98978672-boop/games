extends Node
## Дымовой тест: реальная сцена, настоящий _process, все шесть миссий.
##
## Запуск (без окна):
##   godot --headless --path . --quit-after 4000 tests/test_smoke.gd
##
## Проверяем, что ничего не падает и что за прогон происходит бой:
## выстрелы, попадания, регдолы, отлетевшее оружие, смена волн.

var game: SH2Game
var fails: int = 0
var checks: int = 0
var frames: int = 0
var phase: int = 0
var phase_t: float = 0.0
var shots_before: int = 0
var kills_before: int = 0
var mission_i: int = 0


func ok(cond: bool, label: String) -> void:
	checks += 1
	if cond:
		print("  ok   ", label)
	else:
		fails += 1
		print("  FAIL ", label)


func _ready() -> void:
	print("=== СЕКТОР «ПЕПЕЛ» · дым (Godot) ===")
	game = SH2Game.new()
	game.name = "Main"
	add_child(game)
	await get_tree().process_frame
	ok(game.player != null, "игрок создан")
	ok(game.ui != null and game.world != null, "UI и мир собраны")
	ok(game.level_root != null, "уровень меню построен")
	_start_mission(0)


func _start_mission(index: int) -> void:
	mission_i = index
	game.start_mission(index)
	ok(game.state == "playing", "миссия %d начата" % (index + 1))
	ok(game.enemies.size() > 0, "миссия %d: боевиков %d" % [index + 1, game.enemies.size()])
	ok(game.objectives.size() > 0, "миссия %d: целей %d" % [index + 1, game.objectives.size()])
	shots_before = game.player.shots
	kills_before = game.kills
	phase = 0
	phase_t = 0.0


func _process(delta: float) -> void:
	if game == null or game.state != "playing":
		return
	frames += 1
	phase_t += delta
	# имитация действий игрока: идём вперёд, стреляем, иногда приседаем и бросаем гранату
	game.crouch_toggle = int(frames / 90) % 2 == 1
	var target = game.nearest_alive_enemy()
	if target != null:
		var dx: float = target.x - game.player.x
		var dz: float = target.z - game.player.z
		game.player.yaw = atan2(dx, dz)
		game.player.pitch = atan2(1.2 - game.player.eye_height,
			maxf(1.0, Vector2(dx, dz).length()))
		game.try_shoot()
	if frames % 240 == 0 and game.player.grenade_count > 0:
		game.combat.player_grenade()
	if frames % 30 == 0:
		game.player.start_reload()

	if phase_t > 6.0 and phase == 0:
		phase = 1
		ok(game.player.shots > shots_before, "миссия %d: игрок стрелял (%d выстрелов)"
			% [mission_i + 1, game.player.shots])
		ok(game.enemies.size() > 0, "миссия %d: бойцы живы и думают" % (mission_i + 1))
		var thinking := false
		for e in game.enemies:
			if e.brain != null and e.brain.scores.size() > 0:
				thinking = true
				break
		ok(thinking, "миссия %d: ИИ оценил тактики" % (mission_i + 1))
	if phase_t > 14.0 and phase == 1:
		phase = 2
		ok(game.kills >= kills_before, "миссия %d: убийств %d" % [mission_i + 1, game.kills])
		ok(game.player.alive, "миссия %d: игрок жив после 14 с боя" % (mission_i + 1))
		ok(SH2Animator.cache_size() > 0, "кэш анимаций работает (%d)" % SH2Animator.cache_size())
	if phase_t > 16.0 and phase == 2:
		phase = 3
		if mission_i < SH2Data.MISSIONS.size() - 1:
			_start_mission(mission_i + 1)
		else:
			_finish()


func _finish() -> void:
	print("--- кадров: %d, проверок: %d, провалов: %d ---" % [frames, checks, fails])
	# меню и лаборатория тоже должны пережить кадр
	game.go_menu()
	game.ui.show_screen("menu")
	game.ui.open_lab()
	game.ui.lab_cycle("clip", 1)
	game.ui.lab_cycle("part", 1)
	game.ui.lab_cycle("variant", 1)
	ok(game.state == "lab", "лаборатория открылась")
	game.ui.lab_back()
	ok(game.state == "menu", "лаборатория закрылась")
	get_tree().quit(1 if fails > 0 else 0)
