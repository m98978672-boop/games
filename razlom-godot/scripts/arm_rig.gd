class_name RazlomArmRig
extends RefCounted
## Local-space two-bone solve with block-built, first-person limb geometry.
var parent: Node3D
var segments: Array[Node3D] = []
var elbow := Vector3.ZERO
var wrist := Vector3.ZERO
var joint: MeshInstance3D
var hand: Node3D
var hand_knuckles: Array[Node3D] = []
var fist_mode := false
var handedness := -1.0

func _init(host: Node3D, hand_side: float = -1.0) -> void:
	parent = host
	handedness = -1.0 if hand_side < 0 else 1.0
	var cloth := RazlomArt.material(Color("65756b"), "cloth")
	for i in range(2):
		var segment := Node3D.new()
		segment.set_meta("arm_rig_part", true)
		host.add_child(segment)
		var visual := MeshInstance3D.new()
		var mesh := BoxMesh.new()
		mesh.size = Vector3(0.09, 0.09, 1.0)
		visual.rotation.x = PI * 0.5
		visual.mesh = mesh
		visual.material_override = cloth
		segment.add_child(visual)
		# Square stitched panels and cuffs keep the silhouette on the voxel grid.
		RazlomArt.box(segment, Vector3(0, 0.035, 0), Vector3(0.016, 0.012, 0.64), RazlomArt.material(Color("738274"), "cloth"))
		RazlomArt.box(segment, Vector3(0, 0, -0.37), Vector3(0.094, 0.065, 0.035), RazlomArt.material(Color("45534c"), "cloth"))
		RazlomArt.box(segment, Vector3(0, 0, 0.36), Vector3(0.088, 0.06, 0.03), RazlomArt.material(Color("45534c"), "cloth"))
		segments.append(segment)
	joint = MeshInstance3D.new()
	joint.set_meta("arm_rig_part", true)
	var joint_mesh := BoxMesh.new()
	joint_mesh.size = Vector3(0.09, 0.09, 0.09)
	joint.mesh = joint_mesh
	joint.material_override = cloth
	host.add_child(joint)
	# Palm, knuckles and fingers are separate square pieces, never round beads.
	hand = Node3D.new()
	hand.name = "IKHand"
	host.add_child(hand)
	var glove := RazlomArt.material(Color("39463f"), "cloth")
	var glove_highlight := RazlomArt.material(Color("56645a"), "cloth")
	var seam := RazlomArt.material(Color("8b927e"))
	var palm := RazlomArt.box(hand, Vector3(0, 0, -0.035), Vector3(0.078, 0.06, 0.09), glove)
	palm.name = "Palm"
	for i in range(4):
		var finger := Node3D.new()
		finger.name = "Finger%d" % i
		hand.add_child(finger)
		finger.position = Vector3(-0.037 + i * 0.025, -0.012, -0.09)
		for segment_index in range(3):
			var segment := MeshInstance3D.new()
			var mesh := BoxMesh.new()
			mesh.size = Vector3(0.017 if i in [0, 3] else 0.019, [0.034, 0.03, 0.025][segment_index], 0.018)
			segment.mesh = mesh
			segment.material_override = glove
			segment.rotation.x = -PI * 0.5
			segment.position.z = -0.014 - segment_index * 0.024
			finger.add_child(segment)
		var knuckle := RazlomArt.box(finger, Vector3(0, 0.009, -0.074), Vector3(0.014, 0.004, 0.008), glove_highlight)
		knuckle.name = "SquareKnuckle"
		var seam_mark := RazlomArt.box(finger, Vector3(0, 0.009, -0.09), Vector3(0.01, 0.003, 0.003), seam)
		seam_mark.name = "Stitch"
		hand_knuckles.append(finger)
	var thumb := MeshInstance3D.new()
	thumb.name = "Thumb"
	var thumb_mesh := BoxMesh.new()
	thumb_mesh.size = Vector3(0.024, 0.055, 0.02)
	thumb.mesh = thumb_mesh
	thumb.material_override = glove
	thumb.position = Vector3(handedness * 0.06, 0.004, -0.045)
	thumb.rotation = Vector3(-PI * 0.5, 0.0, handedness * 0.58)
	hand.add_child(thumb)
	var thumb_joint := RazlomArt.box(hand, Vector3(handedness * 0.074, 0.002, -0.078), Vector3(0.026, 0.022, 0.02), glove_highlight)
	thumb_joint.name = "ThumbJoint"
	thumb_joint.rotation.z = handedness * 0.4
	var wrist_cuff := RazlomArt.box(hand, Vector3(0, 0, 0.022), Vector3(0.105, 0.068, 0.04), cloth)
	wrist_cuff.name = "Cuff"
	RazlomArt.box(hand, Vector3(0, 0.008, 0.041), Vector3(0.075, 0.005, 0.004), seam)

func solve(shoulder: Vector3, target: Vector3, side: float) -> void:
	var axis := target - shoulder
	if axis.length_squared() < 0.000001:
		axis = Vector3(0, -0.01, -0.01)
	var distance := clampf(axis.length(), 0.06, 1.01)
	var direction := axis.normalized()
	wrist = shoulder + direction * distance
	var pole := Vector3(side, -0.75, 0.28)
	pole -= direction * pole.dot(direction)
	if pole.length_squared() < 0.001:
		pole = direction.cross(Vector3.FORWARD)
	if pole.length_squared() < 0.001:
		pole = direction.cross(Vector3.UP)
	pole = pole.normalized()
	# Finite reach and nonzero elbow bend prevent hyperextension.
	elbow = (shoulder + wrist) * 0.5 + pole * sqrt(maxf(0.0025, 0.52 * 0.52 - distance * distance * 0.25))
	place(segments[0], shoulder, elbow)
	place(segments[1], elbow, wrist)
	joint.position = elbow
	hand.position = wrist
	var hand_up := Vector3.UP if absf(direction.dot(Vector3.UP)) < 0.95 else Vector3.FORWARD
	hand.basis = Basis.looking_at(direction, hand_up)
	hand.scale = Vector3.ONE * 0.82
	hand.rotation.z += sin(Time.get_ticks_msec() * 0.003 + side) * 0.018
	for i in range(hand_knuckles.size()):
		var curl := -0.62 if fist_mode else -0.12
		hand_knuckles[i].rotation.x = curl + sin(Time.get_ticks_msec() * 0.002 + i * 0.4 + side) * 0.02

func set_fist_mode(value: bool) -> void:
	fist_mode = value

func place(segment: Node3D, start: Vector3, finish: Vector3) -> void:
	segment.position = (start + finish) * 0.5
	var direction := (finish - start).normalized()
	var up := Vector3.UP if absf(direction.dot(Vector3.UP)) < 0.95 else Vector3.FORWARD
	segment.basis = Basis.looking_at(direction, up) * Basis.from_scale(Vector3(0.84, 0.84, maxf(0.001, start.distance_to(finish))))

func set_visible(value: bool) -> void:
	for segment in segments: segment.visible = value
	joint.visible = value
	hand.visible = value
