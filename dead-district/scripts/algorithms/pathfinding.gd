class_name Pathfinding
extends RefCounted
## Навигация орды и выживших:
## 1) A* с бинарной мин-кучей для одиночных агентов (NPC, отложенный путь): O(E log V).
## 2) Flow Field (Dijkstra Map + вектор градиента) для 150 активных зомби: O(R^2) на цель, O(1) на зомби.


class MinHeap:
	extends RefCounted
	var _data: Array = []  # [[priority, value], ...]

	func is_empty() -> bool:
		return _data.is_empty()

	func push(priority: float, val: Variant) -> void:
		_data.append([priority, val])
		var i := _data.size() - 1
		while i > 0:
			var p := (i - 1) >> 1
			if float(_data[p][0]) <= float(_data[i][0]):
				break
			var tmp: Variant = _data[p]
			_data[p] = _data[i]
			_data[i] = tmp
			i = p

	func pop() -> Variant:
		var top: Variant = _data[0][1]
		var last: Variant = _data.pop_back()
		if not _data.is_empty():
			_data[0] = last
			var n := _data.size()
			var i := 0
			while true:
				var left := i * 2 + 1
				var right := i * 2 + 2
				var best := i
				if left < n and float(_data[left][0]) < float(_data[best][0]):
					best = left
				if right < n and float(_data[right][0]) < float(_data[best][0]):
					best = right
				if best == i:
					break
				var tmp: Variant = _data[i]
				_data[i] = _data[best]
				_data[best] = tmp
				i = best
		return top


## Поиск пути A* (8 направлений без срезки углов стен).
static func find_path_astar(start: Vector2i, goal: Vector2i, is_walkable: Callable, max_iterations: int = 800) -> Array[Vector2i]:
	if start == goal:
		return [goal]

	var heap := MinHeap.new()
	heap.push(0.0, start)
	var came_from: Dictionary = {}
	var cost_so_far: Dictionary = {start: 0.0}
	var best_closest := start
	var best_h := Vector2(start).distance_to(Vector2(goal))

	var dirs := [
		Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1),
		Vector2i(1, 1), Vector2i(-1, 1), Vector2i(1, -1), Vector2i(-1, -1)
	]

	var iters := 0
	var found := false
	while not heap.is_empty() and iters < max_iterations:
		iters += 1
		var current: Vector2i = heap.pop()
		if current == goal:
			found = true
			break

		var cur_cost := float(cost_so_far[current])
		for d in dirs:
			var nxt := current + d
			if not is_walkable.call(nxt):
				continue
			# Запрещаем диагональное просачивание через угол двух стен
			if d.x != 0 and d.y != 0:
				if not is_walkable.call(current + Vector2i(d.x, 0)) or not is_walkable.call(current + Vector2i(0, d.y)):
					continue
			var step_cost := 1.4142 if (d.x != 0 and d.y != 0) else 1.0
			var new_cost := cur_cost + step_cost
			if not cost_so_far.has(nxt) or new_cost < float(cost_so_far[nxt]):
				cost_so_far[nxt] = new_cost
				var h := Vector2(nxt).distance_to(Vector2(goal))
				if h < best_h:
					best_h = h
					best_closest = nxt
				heap.push(new_cost + h * 1.1, nxt)
				came_from[nxt] = current

	if not found and iters >= max_iterations:
		ErrorManager.warn("E401", "Pathfinding", "A* достиг лимита итераций", {"start": start, "goal": goal})

	var target := goal if found else best_closest
	var path: Array[Vector2i] = []
	var cur := target
	while cur != start and came_from.has(cur):
		path.append(cur)
		cur = came_from[cur]
	path.reverse()
	return path


## Flow Field (Dijkstra Map + векторное поле направлений) в радиусе R тайлов от цели.
## Позволяет всем 150 активным зомби обходить здания за O(1) на агента.
static func build_flow_field(goal: Vector2i, radius: int, is_walkable: Callable) -> Dictionary:
	var dist: Dictionary = {goal: 0}
	var queue: Array[Vector2i] = [goal]
	var head := 0
	var r2 := radius * radius
	var dirs4 := [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]

	while head < queue.size():
		var cur: Vector2i = queue[head]
		head += 1
		var d_cur := int(dist[cur])
		for d in dirs4:
			var nxt := cur + d
			var off := nxt - goal
			if off.x * off.x + off.y * off.y > r2:
				continue
			if dist.has(nxt):
				continue
			if not is_walkable.call(nxt):
				continue
			dist[nxt] = d_cur + 1
			queue.append(nxt)

	var vectors: Dictionary = {}
	var dirs8 := [
		Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1),
		Vector2i(1, 1), Vector2i(-1, 1), Vector2i(1, -1), Vector2i(-1, -1)
	]
	for tile in dist.keys():
		var best_n: Vector2i = tile
		var best_d := int(dist[tile])
		for d in dirs8:
			var nxt: Vector2i = tile + d
			if dist.has(nxt) and int(dist[nxt]) < best_d:
				best_d = int(dist[nxt])
				best_n = nxt
		var dir_vec := Vector2(best_n - tile)
		vectors[tile] = dir_vec.normalized() if dir_vec.length_squared() > 0.0 else Vector2.ZERO

	return {"goal": goal, "dist": dist, "vectors": vectors}


static func sample_flow(field: Dictionary, tile: Vector2i) -> Vector2:
	var vecs: Dictionary = field.get("vectors", {})
	if vecs.has(tile):
		return vecs[tile]
	return Vector2.ZERO
