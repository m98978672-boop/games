class_name RazlomArmRig
extends RefCounted
## Visual two-segment arms: shoulder is body-fixed, wrist follows the weapon grip.
var parent: Node3D
var segments: Array[Node3D] = []
var elbow := Vector3.ZERO
var wrist := Vector3.ZERO
func _init(host: Node3D) -> void:
	parent = host
	for i in range(2):
		var segment := Node3D.new()
		host.add_child(segment)
		var visual := MeshInstance3D.new()
		var mesh := CylinderMesh.new()
		mesh.top_radius = 0.034
		mesh.bottom_radius = 0.043
		mesh.height = 1.0
		mesh.radial_segments = 8
		mesh.rings = 1
		visual.rotation.x = PI * 0.5
		visual.mesh = mesh
		visual.material_override = RazlomArt.material(Color("65756b"), "cloth")
		segment.add_child(visual)
		segments.append(segment)
func solve(shoulder: Vector3, target: Vector3, side: float) -> void:
	wrist = target
	var axis := target - shoulder
	var distance := maxf(0.001, axis.length())
	# Equal-length two-bone solution; a little visual stretch prevents wrist gaps.
	var length := maxf(0.34, distance * 0.52)
	var direction := axis / distance
	var pole := Vector3(side, -1.0, 0.0)
	pole = (pole - direction * pole.dot(direction)).normalized()
	elbow = (shoulder + target) * 0.5 + pole * sqrt(maxf(0.0, length * length - distance * distance * 0.25))
	place(segments[0], shoulder, elbow)
	place(segments[1], elbow, target)
func place(segment: Node3D, start: Vector3, finish: Vector3) -> void:
	segment.position = (start + finish) * 0.5
	if start.distance_to(finish) > 0.001:
		segment.look_at(parent.to_global(finish), Vector3.UP)
	segment.scale = Vector3(1, 1, maxf(0.001, start.distance_to(finish)))
