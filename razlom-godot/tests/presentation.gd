extends SceneTree
## Structural/runtime animation and stream validation. Does not validate pixels or speakers.
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
	var guard = game.enemies[0]
	var motion: RazlomActorMotion = guard.motion
	check(motion.joints.size() == 4, "Guard has four animated joints")
	var foot: Node3D = guard.visual.get_node("LegLJoint/LegL")
	check(foot.position.y < 0, "Limb is offset from its hip pivot")
	motion.advance(0.17, 2.7)
	check(absf(motion.joints.LegL.rotation.x) > 0.01, "Walking animates a leg")
	check(is_equal_approx(motion.joints.LegL.rotation.x, -motion.joints.LegR.rotation.x), "Opposing legs alternate")
	for i in range(60):
		motion.advance(1.0 / 60, 0)
	check(absf(motion.joints.LegL.rotation.x) < 0.001, "Idle settles legs instead of freezing a mid-step pose")
	# Aim must blend into its pose rather than snapping in a single frame.
	for i in range(90):
		motion.advance(1.0 / 60, 0, true)
	motion.fire()
	motion.advance(0.01, 0, true)
	check(motion.joints.ArmL.rotation.x < -0.65, "Firing recoil animates raised arms")
	var dog_motion: RazlomActorMotion = game.dog.motion
	dog_motion.advance(0.12, 2.6)
	check(dog_motion.joints.size() == 4, "Dog has four hip joints")
	check(is_equal_approx(dog_motion.joints.LegFL.rotation.x, dog_motion.joints.LegBR.rotation.x), "Dog uses diagonal gait")
	for i in range(60):
		dog_motion.advance(1.0 / 60, 0)
	check(absf(dog_motion.joints.LegFL.rotation.x) < 0.001, "Waiting dog settles its gait")
	motion.hurt()
	motion.advance(0.04, 0, false)
	check(motion.model.rotation.z > 0.001, "Hit reaction tilts the guard visually")
	for i in range(120):
		motion.advance(1.0 / 60, 0, false)
	var idle_tilt := sin(motion.clock * 0.7) * 0.025
	check(absf(motion.model.rotation.z - idle_tilt) < 0.006, "Hit reaction settles back to its breathing idle pose")
	check(absf(motion.model.get_node("Head").rotation.y) > 0.001, "Idle guard looks around")
	check(absf(dog_motion.model.get_node("Head").rotation.y) > 0.001, "Waiting dog scans with its head")
	check(game.interactions.medic_motion != null, "Vera has an idle animation driver")
	var courier_motion: RazlomActorMotion = game.interactions.courier_motion
	courier_motion.idle_fidget_wait = 0.01
	courier_motion.advance(0.02, 0)
	check(courier_motion.idle_fidget > 0 and courier_motion.idle_fidget_arm == "ArmR", "An idle courier begins a staggered sleeve-adjustment fidget")
	courier_motion.advance(0.3, 0)
	check(courier_motion.joints.ArmR.rotation.z > 0.02, "Fidget visibly moves the shoulder and arm before settling")
	var player_glove: Node3D = game.player.left_arm.hand
	var player_finger: Node3D = player_glove.get_node("Finger0") as Node3D
	var player_finger_segment := player_finger.get_child(0) as MeshInstance3D
	check(player_glove.has_node("Palm") and player_finger_segment.mesh is CapsuleMesh and not player_glove.has_node("KnuckleRidge0"), "First-person glove keeps attached segmented fingers without floating ornaments")
	var surface := RazlomArt.material(Color.WHITE, "brick")
	check(surface.normal_enabled and surface.normal_texture != null, "Brick relief uses an imported normal map")
	check(surface.roughness_texture != null, "Surface roughness map is bound")
	var track: AudioStreamWAV = game.music.stream
	check(is_equal_approx(track.get_length(), 32.0), "Original music stream is 32 seconds")
	check(track.loop_mode == AudioStreamWAV.LOOP_FORWARD and track.loop_end == 705600, "Music has full-sample loop bounds")
	check(track.mix_rate == 22050 and not track.stereo, "Music sample format is imported correctly")
	game.toggle_music()
	check(not game.music_enabled and game.music.volume_db == -80, "Music can be muted while paused")
	game.toggle_music()
	check(game.music_enabled and game.music.volume_db == -18, "Music can be unmuted")
	# Menu tweens must run while the simulation is paused.
	await create_timer(0.45, true).timeout
	check(paused and game.modal.visible, "Right drawer keeps the game paused")
	check(game.modal.position.x > 700, "Menu is placed on the right of the reference viewport")
	check(is_equal_approx(game.modal.modulate.a, 1), "Drawer fades fully in while paused")
	check(game.menu_style.shade.visible, "Open menu has a world backdrop")
	check(game.start_button.get_theme_stylebox("normal") is StyleBoxFlat, "Primary button has a custom soft theme")
	game.resume()
	check(not paused, "Resume releases gameplay immediately")
	await create_timer(0.3, true).timeout
	check(not game.modal.visible and not game.menu_style.shade.visible, "Closing animation removes both drawer and backdrop")
	game.show_menu("ПЕРЕДЫШКА", "Здесь можно выдохнуть.")
	game.resume()
	game.show_menu("ПЕРЕДЫШКА", "Здесь можно выдохнуть.")
	await create_timer(0.45, true).timeout
	check(game.modal.visible and paused and not game.menu_style.closing, "Rapid reopen cancels an old closing animation")
	check(game.menu_style.shade.mouse_filter == Control.MOUSE_FILTER_STOP, "Reopened backdrop blocks pointer input")
	game.resume()
	await create_timer(0.3, true).timeout
	game.queue_free()
	await process_frame
	print("Presentation checks: %d; failures: %d" % [checks, failures])
	quit(1 if failures > 0 else 0)
