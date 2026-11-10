class_name SpatialIndex
extends RefCounted
## Пространственное индексирование (Spatial Hash Grid + Quadtree) для >1000 сущностей в мире.
## Spatial Hash: O(1) вставка/удаление, O(1 + K) поиск в радиусе.
## Quadtree: O(log N + K) для прямоугольных запросов видимости и иерархических зон.

const CELL_SIZE: float = 8.0
const QUAD_CAP: int = 8
const QUAD_MAX_DEPTH: int = 6

var _buckets: Dictionary = {}  # Vector2i -> Array[Dictionary]
var _entities_by_id: Dictionary = {}


func clear() -> void:
	_buckets.clear()
	_entities_by_id.clear()


func _cell_for(pos: Vector2) -> Vector2i:
	return Vector2i(int(floor(pos.x / CELL_SIZE)), int(floor(pos.y / CELL_SIZE)))


func upsert(entity_id: int, pos: Vector2, tag: String = "zombie") -> void:
	var new_cell := _cell_for(pos)
	if _entities_by_id.has(entity_id):
		var old_rec: Dictionary = _entities_by_id[entity_id]
		var old_cell: Vector2i = old_rec["cell"]
		if old_cell != new_cell and _buckets.has(old_cell):
			var arr: Array = _buckets[old_cell]
			for i in range(arr.size()):
				if int(arr[i]["id"]) == entity_id:
					arr.remove_at(i)
					break
			if arr.is_empty():
				_buckets.erase(old_cell)
			old_rec["cell"] = new_cell
			_add_to_bucket(new_cell, old_rec)
		old_rec["pos"] = pos
		return

	var rec := {"id": entity_id, "pos": pos, "cell": new_cell, "tag": tag}
	_entities_by_id[entity_id] = rec
	_add_to_bucket(new_cell, rec)


func _add_to_bucket(cell: Vector2i, rec: Dictionary) -> void:
	if not _buckets.has(cell):
		_buckets[cell] = []
	_buckets[cell].append(rec)


func remove(entity_id: int) -> void:
	if not _entities_by_id.has(entity_id):
		return
	var rec: Dictionary = _entities_by_id[entity_id]
	var cell: Vector2i = rec["cell"]
	if _buckets.has(cell):
		var arr: Array = _buckets[cell]
		for i in range(arr.size()):
			if int(arr[i]["id"]) == entity_id:
				arr.remove_at(i)
				break
		if arr.is_empty():
			_buckets.erase(cell)
	_entities_by_id.erase(entity_id)


func query_radius(center: Vector2, radius: float, filter_tag: String = "") -> Array[Dictionary]:
	if radius <= 0.0:
		ErrorManager.info("E805", "SpatialIndex", "Запрос с нулевым/отрицательным радиусом", {"r": radius})
		return []
	var out: Array[Dictionary] = []
	var r2 := radius * radius
	var min_c := _cell_for(center - Vector2(radius, radius))
	var max_c := _cell_for(center + Vector2(radius, radius))
	for cy in range(min_c.y, max_c.y + 1):
		for cx in range(min_c.x, max_c.x + 1):
			var cell := Vector2i(cx, cy)
			if not _buckets.has(cell):
				continue
			for rec in _buckets[cell]:
				if filter_tag != "" and String(rec["tag"]) != filter_tag:
					continue
				if center.distance_squared_to(rec["pos"]) <= r2:
					out.append(rec)
	return out


func count() -> int:
	return _entities_by_id.size()


## Вложенная структура Quadtree для зональных запросов мира (например, плотность орды в районе).
class QuadNode:
	extends RefCounted
	var bounds: Rect2
	var depth: int
	var points: Array[Dictionary] = []
	var children: Array[QuadNode] = []

	func _init(b: Rect2, d: int = 0) -> void:
		bounds = b
		depth = d

	func insert(rec: Dictionary) -> bool:
		var p: Vector2 = rec["pos"]
		if not bounds.has_point(p):
			return false
		if children.is_empty() and (points.size() < QUAD_CAP or depth >= QUAD_MAX_DEPTH):
			points.append(rec)
			return true
		if children.is_empty():
			_subdivide()
		for ch in children:
			if ch.insert(rec):
				return true
		points.append(rec)
		return true

	func _subdivide() -> void:
		var hw := bounds.size.x * 0.5
		var hh := bounds.size.y * 0.5
		var x := bounds.position.x
		var y := bounds.position.y
		children = [
			QuadNode.new(Rect2(x, y, hw, hh), depth + 1),
			QuadNode.new(Rect2(x + hw, y, hw, hh), depth + 1),
			QuadNode.new(Rect2(x, y + hh, hw, hh), depth + 1),
			QuadNode.new(Rect2(x + hw, y + hh, hw, hh), depth + 1)
		]
		var old := points.duplicate()
		points.clear()
		for r in old:
			for ch in children:
				if ch.insert(r):
					break

	func query_rect(area: Rect2, out: Array[Dictionary]) -> void:
		if not bounds.intersects(area):
			return
		for r in points:
			if area.has_point(r["pos"]):
				out.append(r)
		for ch in children:
			ch.query_rect(area, out)


func build_quadtree(bounds: Rect2) -> QuadNode:
	var root := QuadNode.new(bounds, 0)
	for rec in _entities_by_id.values():
		root.insert(rec)
	return root
