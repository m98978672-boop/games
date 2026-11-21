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
func press_named(game, prefix: String) -> bool:
	for child in game.interactions.column.get_children():
		if child is Button and child.text.begins_with(prefix):
			child.pressed.emit()
			return true
	return false
func has_natural_face(model: Node3D) -> bool:
	var head := model.get_node_or_null("Head") as Node3D
	if head == null:
		return false
	var face := head.get_node_or_null("Visual") as MeshInstance3D
	if face == null or not face.mesh is BoxMesh:
		return false
	var head_size: Vector3 = (face.mesh as BoxMesh).size
	if head_size != Vector3(0.30, 0.34, 0.30):
		return false
	if not head.has_node("NoseTip") or not head.has_node("EyeL") or not head.has_node("EyeR") or not head.has_node("BrowL") or not head.has_node("BrowR"):
		return false
	var brow_l := head.get_node("BrowL") as Node3D
	var brow_r := head.get_node("BrowR") as Node3D
	if brow_l.get_child_count() == 0 or brow_r.get_child_count() == 0:
		return false
	var brow_l_visual := brow_l.get_child(0) as MeshInstance3D
	var brow_r_visual := brow_r.get_child(0) as MeshInstance3D
	if brow_l_visual == null or brow_r_visual == null or not brow_l_visual.mesh is BoxMesh or not brow_r_visual.mesh is BoxMesh:
		return false
	var brow_l_size: Vector3 = (brow_l_visual.mesh as BoxMesh).size
	var brow_r_size: Vector3 = (brow_r_visual.mesh as BoxMesh).size
	var brow_l_mat := brow_l_visual.material_override as StandardMaterial3D
	var brow_r_mat := brow_r_visual.material_override as StandardMaterial3D
	if brow_l_mat == null or brow_r_mat == null or brow_l_mat.shading_mode != BaseMaterial3D.SHADING_MODE_UNSHADED or brow_r_mat.shading_mode != BaseMaterial3D.SHADING_MODE_UNSHADED:
		return false
	if brow_r.position.x - brow_l.position.x - (brow_l_size.x + brow_r_size.x) * 0.5 < 0.03:
		return false
	if head.get_node("EyeL").position.z > -0.15 or head.get_node("EyeR").position.z > -0.15:
		return false
	for eye_name in ["EyeL", "EyeR"]:
		var eye := head.get_node_or_null(eye_name) as Node3D
		if eye == null or not eye.has_node("Iris") or not eye.has_node("Pupil") or not eye.has_node("Sclera"):
			return false
		var sclera_root := eye.get_node("Sclera") as Node3D
		if sclera_root.get_child_count() == 0:
			return false
		var sclera := sclera_root.get_child(0) as MeshInstance3D
		if sclera == null or not sclera.mesh is BoxMesh:
			return false
		var sclera_size: Vector3 = (sclera.mesh as BoxMesh).size
		if sclera_size.x > 0.041 or sclera_size.y > 0.025 or sclera_size.z > 0.011:
			return false
		var iris := eye.get_node("Iris") as MeshInstance3D
		if iris == null or not iris.mesh is BoxMesh:
			return false
	return true
func has_clean_forehead(model: Node3D) -> bool:
	var head := model.get_node_or_null("Head") as Node3D
	if head == null or head.has_node("Fringe0") or head.has_node("Fringe1") or head.has_node("Fringe2"):
		return false
	for name in ["TempleHairL", "TempleHairR"]:
		var lock := head.get_node_or_null(name) as Node3D
		if lock == null or lock.get_child_count() == 0 or absf(lock.position.x) < 0.11:
			return false
		var visual := lock.get_child(0) as MeshInstance3D
		if visual == null or not visual.mesh is BoxMesh:
			return false
	return true
func run_tests() -> void:
	var game = load("res://scenes/main.tscn").instantiate()
	root.add_child(game)
	await process_frame
	var guard = game.enemies[0]
	check(has_natural_face(guard.visual), "Guards have shaped heads and compact inset eyes")
	check(guard.left_arm.hand.has_node("Palm") and guard.left_arm.hand.get_node("Finger0").get_child(0).mesh is BoxMesh, "Guard glove uses block-built palms and segmented fingers")
	var medic = game.interactions.medic_motion.model
	check(has_natural_face(medic), "Vera has the same shaped head and compact inset eyes")
	check(has_clean_forehead(medic), "Vera's temple hair leaves two brows separate and no third forehead bar")
	check(medic.has_node("ArmLJoint/ArmL/Elbow/CharacterHand/Palm"), "Vera's hand is attached through a separate animated elbow and forearm")
	var vera_sleeve := medic.get_node("ArmLJoint/ArmL/Visual") as MeshInstance3D
	check(vera_sleeve.mesh is BoxMesh and (vera_sleeve.mesh as BoxMesh).size.is_equal_approx(Vector3(0.14, 0.28, 0.18)), "NPC upper sleeves end at a compact elbow instead of remaining rigid shoulder-to-wrist bars")
	check(medic.has_node("ArmLJoint/ArmL/Elbow/Forearm") and medic.has_node("ArmRJoint/ArmR/Elbow/Forearm"), "Both humanoid arms include forearms beneath their elbow pivots")
	var vera_hand: Node3D = medic.get_node("ArmLJoint/ArmL/Elbow/CharacterHand") as Node3D
	var vera_right_hand: Node3D = medic.get_node("ArmRJoint/ArmR/Elbow/CharacterHand") as Node3D
	check(vera_hand.has_node("Finger0") and vera_hand.has_node("Finger3") and vera_hand.has_node("Thumb"), "Vera's hands have short connected fingers and correctly mirrored thumbs")
	check(vera_hand.get_node("Thumb").position.x < 0 and vera_right_hand.get_node("Thumb").position.x > 0, "Both civilian hands mirror their thumbs toward the correct sides")
	var pavel: Node3D = game.world.get_node("Pavel").find_child("guard", true, false) as Node3D
	check(pavel != null and has_natural_face(pavel), "Pavel uses the same shaped head and compact eyes")
	var pavel_left: Node3D = pavel.get_node("ArmLJoint/ArmL/Elbow/CharacterHand") as Node3D
	var pavel_right: Node3D = pavel.get_node("ArmRJoint/ArmR/Elbow/CharacterHand") as Node3D
	check(pavel_left != null and pavel_right != null and pavel_left.get_node("Palm") != null and pavel_right.get_node("Palm") != null, "Every civilian humanoid receives attached modeled hands")
	check(pavel_left.get_node("Thumb").position.x < 0 and pavel_right.get_node("Thumb").position.x > 0, "Pavel's mirrored hands do not share the same thumb orientation")
	var pavel_left_shoulder: Node3D = pavel.get_node("ArmLJoint") as Node3D
	var pavel_right_shoulder: Node3D = pavel.get_node("ArmRJoint") as Node3D
	check(absf(pavel_left_shoulder.position.x) <= 0.34 and absf(pavel_right_shoulder.position.x) <= 0.34 and pavel_left_shoulder.position.x < 0.0 and pavel_right_shoulder.position.x > 0.0, "Guard shoulders sit close enough to the torso to avoid a floating sleeve seam")
	check(game.world.has_node("Pavel"), "Courier exists in playable world")
	var count: int = guard.visual.get_child_count()
	RazlomArt.dress_actor(guard.visual)
	check(guard.visual.get_child_count() == count, "Detailing is idempotent")
	guard.motion.blink_clock = 4.17
	guard.motion.advance(0.01, 0)
	check(guard.visual.get_node("Head/EyeL").scale.y < 0.1, "Eyes blink")
	guard.motion.advance(0.2, 0)
	check(guard.visual.get_node("Head/EyeL").scale.y == 1.0, "Eyes reopen")
	game.interactions.medic_motion.greet()
	game.interactions.medic_motion.advance(0.2, 0)
	check(game.interactions.medic_motion.joints.ArmR.rotation.x < -0.4, "Conversation gesture raises hand")
	check(game.interactions.medic_motion.elbows.ArmR.rotation.x > 0.1, "Greeting bends Vera's elbow so the forearm and hand do not move as one rigid bar")
	var vera_left_joint: Node3D = game.interactions.medic_motion.joints.ArmL
	var vera_right_joint: Node3D = game.interactions.medic_motion.joints.ArmR
	var vera_left_hand_position := vera_hand.position
	var vera_hand_before_treatment := vera_hand.global_position
	game.interactions.medic_motion.greet("treat")
	for i in range(18):
		game.interactions.medic_motion.advance(1.0 / 60.0, 0.0)
	check(game.interactions.medic_motion.elbows.ArmL.rotation.x > 0.1 and vera_hand.global_position.distance_to(vera_hand_before_treatment) > 0.03, "Treatment gesture bends and moves the forearm with its attached hand")
	game.interactions.medic_motion.react("arms", Vector3(-0.3, 1.1, 0), 1.0)
	for i in range(90):
		game.interactions.medic_motion.advance(1.0 / 60.0, 0.0)
	check(vera_left_joint.position.x < 0.0 and vera_right_joint.position.x > 0.0 and absf(absf(vera_left_joint.position.x) - absf(vera_right_joint.position.x)) < 0.001 and absf(vera_left_joint.position.x) <= 0.34, "NPC sleeves overlap their shoulder sockets instead of floating beyond the torso")
	check(vera_left_joint.rotation.x >= -1.39 and vera_left_joint.rotation.x <= 0.51 and vera_right_joint.rotation.x >= -1.39 and vera_right_joint.rotation.x <= 0.51, "Flinch and greeting keep every NPC shoulder inside its safe anatomical range")
	check(absf(vera_left_joint.rotation.z) <= 0.351 and absf(vera_right_joint.rotation.z) <= 0.351, "NPC shoulders cannot twist sleeves into a broken side-on pose")
	check(vera_hand.position.is_equal_approx(vera_left_hand_position), "NPC hands stay attached to the sleeve through the full gesture and flinch")
	var s = game.state
	var legacy: Dictionary = s.snapshot()
	legacy.erase("passage")
	check(s.restore(legacy) and not s.passage, "Old saves have no passage by default")
	var bad: Dictionary = s.snapshot()
	bad.passage = "yes"
	check(not s.restore(bad) and not s.passage, "Invalid passage flag rejected atomically")
	s.bottles = 1
	game.interactions.courier_dialog()
	game.interactions.column.get_child(2).pressed.emit()
	check(s.passage and s.bottles == 0, "Real courier choice costs one bottle and grants passage")
	game.interactions.courier_dialog()
	check(game.interactions.column.get_child_count() == 3, "Passage cannot be bought twice while active")
	game.resume()
	guard.visible_contact = true
	guard.last_seen = game.player.global_position
	var health: float = s.health
	game.enemy_fire(guard)
	check(s.health == health, "Passage blocks enemy fire")
	guard.choose_target(0.1)
	check(guard.behavior == "stand_down" and not guard.alert, "Guards stand down under agreement")
	var saved: Dictionary = s.snapshot()
	s.passage = false
	check(s.restore(saved) and s.passage, "Agreement survives state serialization")
	guard.hit(1)
	check(not s.passage, "Attacking a guard breaks agreement")
	game.interactions.courier_dialog()
	check(game.interactions.column.get_child_count() == 3 and s.passage_broken, "Broken agreement cannot be repurchased")
	guard.health = 30
	guard.visible_contact = true
	guard.scan = 1.0
	guard.last_seen = guard.global_position + Vector3(4, 0, 0)
	guard._physics_process(0.016)
	check(guard.behavior == "withdraw", "Wounded guard withdraws from visible contact")
	guard.visible_contact = false
	guard._physics_process(0.016)
	check(guard.behavior != "withdraw", "Withdrawal does not track an unseen player")
	for button in game.find_children("*", "Button", true, false):
		if button.text.begins_with("Обзор ·"):
			button.pressed.emit()
	check(is_equal_approx(game.look_scale, 1.4), "Sensitivity menu changes actual input multiplier")
	s.complete = true
	s.relay_log = true
	s.relay_shared = true
	game.interactions.vera_dialog()
	check(press_named(game, "Дело Веры • медицинский") and game.interactions.column.get_child(1).text.contains("Запечатанный ящик"), "Vera directly offers her medical side quest")
	check(press_named(game, "Взяться за дело") and game.quests.phase("medicine") == 1, "Medical quest can be accepted directly through Vera")
	game.interactions.vera_dialog()
	check(press_named(game, "Дело Веры • раненый электрик"), "Same character offers a separate rescue quest")
	check(press_named(game, "Взяться за дело") and game.quests.phase("engineer") == 1, "Vera's second quest can be active alongside the first")
	game.interactions.vera_dialog()
	check(press_named(game, "Дело Веры • запитать северный шлюз"), "After returning the archive, Vera offers a third technical quest")
	game.resume()
	game.interactions.vera_dialog()
	check(press_named(game, "Спросить Веру"), "Mutual romance conversation only unlocks after the main rescue")
	check(game.state.vera_bond == 0 and game.interactions.panel.visible, "Romance does not advance before the player's answer")
	check(press_named(game, "Предложить узнать"), "Vera has a clear, optional consent choice")
	check(game.state.vera_bond == 1, "Vera accepts a slow mutual courtship")
	game.refresh_world_state()
	check(game.world.has_node("ShelterImprovements/EveningTable"), "A relationship milestone changes the shelter scene")
	game.interactions.vera_dialog()
	check(press_named(game, "Обсудить, какими"), "Second relationship step requires the shared relay story")
	check(press_named(game, "Да. Давай попробуем"), "Both characters explicitly choose the relationship")
	check(game.state.vera_bond == 2, "Chosen relationship reaches the saved committed stage")
	var romance_save: Dictionary = s.snapshot()
	var restored_romance := RazlomState.new()
	check(restored_romance.restore(romance_save) and restored_romance.vera_bond == 2, "Romance choice survives save serialization")
	var older_romance: Dictionary = romance_save.duplicate(true)
	older_romance.erase("vera_bond")
	check(restored_romance.restore(older_romance) and restored_romance.vera_bond == 0, "Older saves migrate without a romance flag")
	game.interactions.journal()
	check(game.interactions.panel.visible, "Journal remains available after broken agreement")
	game.queue_free()
	await process_frame
	print("Character/story checks: %d; failures: %d" % [checks, failures])
	quit(1 if failures > 0 else 0)
