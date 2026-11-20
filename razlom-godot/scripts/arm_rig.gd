class_name RazlomArmRig
extends RefCounted
## Local-space two-bone solve. No world look_at on scaled/rotated parents.
var parent: Node3D
var segments: Array[Node3D] = []
var elbow := Vector3.ZERO
var wrist := Vector3.ZERO
var joint: MeshInstance3D
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
func place(segment: Node3D, start: Vector3, finish: Vector3) -> void:
	segment.position = (start + finish) * 0.5
	var direction := (finish - start).normalized()
	var up := Vector3.UP if absf(direction.dot(Vector3.UP)) < 0.95 else Vector3.FORWARD
	segment.basis = Basis.looking_at(direction, up) * Basis.from_scale(Vector3(1, 1, maxf(0.001, start.distance_to(finish))))
func set_visible(value: bool) -> void:
	for segment in segments: segment.visible = value
	joint.visible = value
