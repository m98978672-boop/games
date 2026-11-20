extends SceneTree
var checks := 0
var failures := 0
func _initialize() -> void:
	call_deferred("run_tests")
func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		printerr("FAIL: " + label)
func run_tests() -> void:
	var game = load("res://scenes/main.tscn").instantiate()
	root.add_child(game)
	await process_frame
	game.resume()
	var player = game.player
	player.set_physics_process(false)
	game.dog.set_physics_process(false)
	for enemy in game.enemies:
		enemy.set_physics_process(false)
	var guard = game.enemies[0]
	guard.position = Vector3(3, 0.3, 35)
	player.position = Vector3(3, 0.3, 40)
	player.camera.look_at(guard.position + Vector3.UP * 0.92)
	await physics_frame
	await physics_frame
	var gun_position: Vector3 = player.gun.position
	game.fire()
	check(guard.health == 64, "Actual shot ray damages the visible guard")
	check(game.combat_feedback.hit_time > 0, "Actual enemy hit confirms on HUD")
	check(player.weapon_motion.flash.visible, "Actual shot starts muzzle animation immediately")
	check(player.gun.position.z > gun_position.z, "Actual shot immediately kicks whole viewmodel")
	check(guard.motion.flinch == 1.0, "Actual shot triggers target flinch")
	guard.motion.advance(0.08, 0, true)
	check(absf(guard.visual.rotation.z) > 0.1, "Hit produces visible torso movement")
	player.weapon_motion.advance(0, 0, 0.1)
	check(player.weapon_motion.shell.visible, "Ejected case has a visible flight stage")
	check(player.weapon_motion.shell.position.x > 0.1, "Case moves away from ejection port")
	player.weapon_motion.advance(0, 0, 0.3)
	check(not player.weapon_motion.shell.visible and not player.weapon_motion.flash.visible, "Shot effects finish and hide")
	player.on_hurt()
	check(player.hurt_blend == 1.0 and game.combat_feedback.hurt_time > 0, "Player injury drives viewmodel and edge feedback")
	game.combat_feedback._process(1)
	check(game.combat_feedback.hurt_time == 0 and game.combat_feedback.hit_time == 0, "HUD cues fully decay")
	var right: Node3D = player.gun.get_node("RightHand")
	var left: Node3D = player.gun.get_node("LeftHand")
	check(absf(right.position.z - player.gun.get_node("Grip").position.z) < 0.015, "Right palm aligns along pistol grip")
	check(left.position.y > -0.09 and left.position.z < -0.25, "Support palm contacts underside of fore-end")
	check(right.has_node("FingerTip3") and left.has_node("FingerTip3"), "Fingers wrap around grips with second segments")
	Input.action_press("forward")
	for i in range(40):
		player._physics_process(1.0 / 60)
	check(player.movement_blend > 0.5 and player.motion_state == "walk", "Actual movement drives sustained weapon walk animation")
	Input.action_press("sprint")
	for i in range(15):
		player._physics_process(1.0 / 60)
	check(player.motion_state == "run" and player.gun.rotation.x < -0.1, "Sprint visibly lowers weapon")
	Input.action_release("forward")
	Input.action_release("sprint")
	for i in range(90):
		player._physics_process(1.0 / 60)
	check(player.movement_blend < 0.01 and player.motion_state == "idle", "Stopping movement settles viewmodel instead of freezing its stride")
	player.set_physics_process(false)
	guard.hit(100)
	await process_frame
	check(not is_instance_valid(guard), "Defeated guard no longer runs AI or collision")
	var corpse: Node3D
	for child in game.world.get_children():
		if child.has_meta("defeat_visual"):
			corpse = child
	check(is_instance_valid(corpse), "Defeat leaves a detached visual to finish falling")
	await create_timer(0.4).timeout
	check(is_instance_valid(corpse) and absf(corpse.visual.rotation.z) > 1.0, "Defeat visual falls rather than disappearing instantly")
	await create_timer(2.1).timeout
	check(is_instance_valid(corpse) and corpse.settled, "Settled corpse remains in world after former cleanup deadline")
	game.queue_free()
	await process_frame
	print("Combat animation checks: %d; failures: %d" % [checks, failures])
	quit(1 if failures > 0 else 0)
