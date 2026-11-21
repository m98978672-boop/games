class_name RazlomArmRig
extends RefCounted
## Local-space two-bone solve. No world look_at on scaled/rotated parents.
var parent: Node3D
var segments: Array[Node3D] = []
var elbow := Vector3.ZERO
var wrist := Vector3.ZERO
var joint: MeshInstance3D
var hand: Node3D
var hand_knuckles: Array[Node3D] = []
var fist_mode := false
func _init(host: Node3D) -> void:
	parent = host
	var cloth := RazlomArt.material(Color("65756b"), "cloth")
	for i in range(2):
		var segment := Node3D.new()
		segment.set_meta("arm_rig_part", true)
		host.add_child(segment)
		var visual := MeshInstance3D.new()
		var mesh := CylinderMesh.new()
		mesh.top_radius = 0.033 if i == 1 else 0.043
		mesh.bottom_radius = 0.042 if i == 1 else 0.049
		mesh.height = 1
		mesh.radial_segments = 16
		mesh.rings = 3
		visual.rotation.x = PI * 0.5
		visual.mesh = mesh
		visual.material_override = cloth
		segment.add_child(visual)
		# Stitched strips and cuff stay in segment space, not world space.
		RazlomArt.box(segment, Vector3(0, 0.035, 0), Vector3(0.016, 0.012, 0.64), RazlomArt.material(Color("738274"), "cloth"))
		RazlomArt.box(segment, Vector3(0, 0, -0.37), Vector3(0.094, 0.065, 0.035), RazlomArt.material(Color("45534c"), "cloth"))
		RazlomArt.box(segment, Vector3(0, 0, 0.36), Vector3(0.088, 0.06, 0.03), RazlomArt.material(Color("45534c"), "cloth"))
		segments.append(segment)
	joint = MeshInstance3D.new()
	joint.set_meta("arm_rig_part", true)
	var sphere := SphereMesh.new()
	sphere.radius = 0.048
	sphere.height = 0.096
	sphere.radial_segments = 12
	sphere.rings = 6
	joint.mesh = sphere
	joint.material_override = cloth
	host.add_child(joint)
	# Rounded glove anatomy: padded palm, two soft finger joints, thumb and cuff.
	# All pieces inherit the wrist pose from the IK solve instead of ending as cubes.
	hand = Node3D.new()
	hand.name = "IKHand"
	host.add_child(hand)
	var glove := RazlomArt.material(Color("39463f"), "cloth")
	RazlomArt.orb(hand, Vector3(0, 0, -0.035), Vector3(0.092, 0.063, 0.105), glove, "Palm")
	for i in range(4):
		var finger := Node3D.new()
		finger.name = "Finger%d" % i
		hand.add_child(finger)
		finger.position = Vector3(-0.037 + i * 0.025, -0.012, -0.09)
		for segment_index in range(2):
			var segment := MeshInstance3D.new()
			var mesh := CapsuleMesh.new()
			mesh.radius = 0.009 if i in [0, 3] else 0.010
			mesh.height = 0.038 if segment_index == 0 else 0.032
			mesh.radial_segments = 8
			mesh.rings = 3
			segment.mesh = mesh
			segment.material_override = glove
			segment.rotation.x = -PI * 0.5
			segment.position.z = -0.018 - segment_index * 0.033
			finger.add_child(segment)
		hand_knuckles.append(finger)
	var thumb := MeshInstance3D.new()
	var thumb_mesh := CapsuleMesh.new()
	thumb_mesh.radius = 0.012
	thumb_mesh.height = 0.058
	thumb_mesh.radial_segments = 8
	thumb_mesh.rings = 3
	thumb.mesh = thumb_mesh
	thumb.material_override = glove
	thumb.position = Vector3(-0.061, 0.004, -0.045)
	thumb.rotation = Vector3(-PI * 0.5, 0.0, -0.58)
	hand.add_child(thumb)
	var wrist_cuff := RazlomArt.box(hand, Vector3(0, 0, 0.022), Vector3(0.105, 0.068, 0.04), cloth)
	wrist_cuff.name = "Cuff"
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
	segment.basis = Basis.looking_at(direction, up) * Basis.from_scale(Vector3(1, 1, maxf(0.001, start.distance_to(finish))))
func set_visible(value: bool) -> void:
	for segment in segments: segment.visible = value
	joint.visible = value
	hand.visible = value
