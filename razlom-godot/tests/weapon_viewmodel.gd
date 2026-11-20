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
	var model = load("res://assets/models/carbine.tscn").instantiate()
	root.add_child(model)
	var motion := RazlomWeaponMotion.new(model)
	check(model.get_node("Receiver/Visual").mesh is ArrayMesh, "Receiver uses authored bevel geometry")
	check(model.get_node("Barrel/Visual").mesh is CylinderMesh, "Barrel has cylindrical silhouette")
	check(model.has_node("LeftHand/Finger3") and model.has_node("RightHand/Thumb"), "Both hands have finger geometry")
	check(model.has_node("Stock") and model.has_node("Magazine") and model.has_node("TriggerLower"), "Weapon has separate stock, magazine and trigger guard")
	var original := motion.magazine.transform
	var hand_original := motion.support_hand.transform
	motion.advance(1.3, 0)
	check(motion.phase == "reach", "Reload starts by reaching for magazine")
	check(motion.support_hand.transform != hand_original, "Support hand actually moves")
	motion.advance(0.8, 0)
	check(motion.phase == "replace" and motion.magazine.position.y < original.origin.y - 0.2, "Magazine is extracted during reload")
	motion.advance(0.2, 0)
	check(motion.bolt.position.z > motion.bolt_rest.origin.z + 0.02, "Bolt racks late in reload")
	motion.advance(0, 0)
	check(motion.magazine.transform.is_equal_approx(original) and motion.support_hand.transform.is_equal_approx(hand_original), "All parts return to exact rest pose")
	motion.advance(0, 0.09)
	check(motion.flash.visible and motion.bolt.position.z > motion.bolt_rest.origin.z, "Shot drives flash and bolt")
	motion.advance(0, 0)
	check(not motion.flash.visible, "Flash cannot remain visible after recoil ends")
	for i in range(100):
		motion.advance(0.8, 0)
	motion.advance(0, 0)
	check(motion.magazine.transform.is_equal_approx(original), "Repeated reload samples do not accumulate transform drift")
	model.queue_free()
	await process_frame
	print("Weapon viewmodel checks: %d; failures: %d" % [checks, failures])
	quit(1 if failures > 0 else 0)
