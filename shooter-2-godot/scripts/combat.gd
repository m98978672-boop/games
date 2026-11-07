extends RefCounted
class_name SH2Combat
## СЕКТОР «ПЕПЕЛ» — бой: пули игрока (хитскан), снаряды боевиков, гранаты.
##
## Пуля игрока — мгновенный луч с трассером до точки попадания.
## Пуля боевика — снаряд: его видно, с линии можно уйти.
## Граната — тело с отскоком и фитилём, взрыв с конусом урона.

var game
var bullets: Array = []
var grenades: Array = []
var hitscan_count: int = 0


func _init(game_ref) -> void:
	game = game_ref


## ------------------------- пуля игрока (хитскан) -------------------------
func player_bullet(origin: Vector3, dir: Vector3, w: Dictionary) -> Vector3:
	hitscan_count += 1
	var max_t: float = float(w["range"])
	var world_hit: Dictionary = game.world.ray_colliders(origin, dir, max_t)
	var best_t: float = float(world_hit["t"]) if not world_hit.is_empty() else max_t
	var target = null
	var hit_y := 0.0

	for e in game.enemies:
		if not e.alive:
			continue
		var t: float = SH2World.ray_cylinder(origin, dir, e.x, e.z, 0.36 * e.scale,
			0.0, 1.82 * e.scale, best_t)
		if t >= 0.0 and t < best_t:
			best_t = t
			target = e
			hit_y = origin.y + dir.y * t

	var end: Vector3 = origin + dir * best_t
	game.fx.tracer(origin - dir * 0.2 + Vector3(0, -0.05, 0), end, w["tracer"])
	if target != null:
		var e = target
		var head_y: float = (1.20 if e.crouch else 1.66) * e.scale
		var is_head: bool = hit_y > head_y - 0.13 * e.scale
		var is_legs: bool = hit_y < 0.62 * e.scale
		var part: String = "head" if is_head else ("limb" if is_legs else "body")
		var dmg: float = float(w["damage"])
		if is_head:
			dmg *= float(w["headshot"])
		elif is_legs:
			dmg *= 0.72
		if best_t > 28.0:
			dmg *= maxf(0.45, 1.0 - (best_t - 28.0) / (float(w["range"]) * 1.6))
		var res: Dictionary = e.take_damage(game, int(round(dmg)), game.player, part, end,
			dir * (2.0 + float(w["damage"]) / 22.0))
		game.player.hits += 1
		game.player.damage_dealt += float(res["damage"])
		if is_head:
			game.player.headshots += 1
		game.ui_hitmarker("head" if is_head else "body", bool(res["killed"]))
		game.audio.hitmarker()
		if is_head:
			game.audio.headshot()
		game.ui_damage_number(end, int(round(dmg)), is_head)
		game.fx.impact(end, Vector3.UP, true)
		if e.brain != null:
			e.brain.alert = 1.0
	else:
		game.fx.impact(end, _normal_hint(dir), false)
	if game.mission.get("type", "") == "destroy":
		game.damage_objective(end.x, end.z, float(w["damage"]))
	return end


func _normal_hint(dir: Vector3) -> Vector3:
	return -dir.normalized()


## ---------------------- пуля боевика (снаряд) ---------------------------
func enemy_bullet(agent, origin: Vector3, dir: Vector3, w: Dictionary) -> void:
	var speed: float = 130.0 if w["id"] == "dmr" else (70.0 if w["id"] == "shotgun" else 95.0)
	bullets.append({
		"pos": origin,
		"dir": dir,
		"speed": speed,
		"damage": float(w["damage"]) * (0.26 if w["id"] == "shotgun" else 0.62),
		"life": 2.2,
		"owner": agent,
		"tracer": w["tracer"],
		"traveled": 0.0,
		"max_dist": float(w["range"]),
	})


## --------------------------- граната от боевика -------------------------
func grenade_from(agent, target: Vector2) -> void:
	var dx: float = target.x - agent.x
	var dz: float = target.y - agent.z
	var dist: float = sqrt(dx * dx + dz * dz)
	var t: float = clampf(dist / 15.0, 0.7, 1.7)
	grenades.append({
		"pos": Vector3(agent.x, 1.3, agent.z),
		"vel": Vector3(dx / t, 6.5, dz / t),
		"fuse": 2.35,
		"owner": agent,
		"node": null,
		"radius": 6.2,
		"damage": 92.0,
		"from_player": false,
	})


func player_grenade() -> void:
	var p = game.player
	if p.grenade_count <= 0:
		game.ui_toast("Гранат нет")
		return
	p.grenade_count -= 1
	var dir: Vector3 = p.ray_direction()
	var origin: Vector3 = p.ray_origin()
	grenades.append({
		"pos": origin + dir * 0.5,
		"vel": Vector3(dir.x * 20.0, 4.5 + dir.y * 18.0, dir.z * 20.0),
		"fuse": 2.15,
		"owner": p,
		"node": null,
		"radius": 7.0,
		"damage": 150.0,
		"from_player": true,
	})
	game.audio.throw_grenade(p.x, p.z)
	game.ui_hud_grenades(p.grenade_count)


func clear() -> void:
	bullets.clear()
	for g in grenades:
		var node = g.get("node", null)
		if node != null and is_instance_valid(node):
			node.queue_free()
	grenades.clear()


## -------------------------------- кадр -----------------------------------
func update(dt: float) -> void:
	_update_bullets(dt)
	_update_grenades(dt)


func _update_bullets(dt: float) -> void:
	var p = game.player
	for i in range(bullets.size() - 1, -1, -1):
		var b: Dictionary = bullets[i]
		b["life"] = float(b["life"]) - dt
		var dist: float = float(b["speed"]) * dt
		var steps: int = maxi(1, int(ceil(dist / 0.55)))
		var step: float = dist / float(steps)
		var dead := false
		var bpos: Vector3 = b["pos"]
		var bdir: Vector3 = b["dir"]
		for s in steps:
			if dead:
				break
			var hit: Dictionary = game.world.ray_colliders(bpos, bdir, step)
			if not hit.is_empty():
				bpos = bpos + bdir * float(hit["t"])
				game.fx.impact(bpos, -bdir, false)
				dead = true
				break
			if p.alive:
				var ph: float = 1.15 if p.crouch else 1.75
				var t: float = SH2World.ray_cylinder(bpos, bdir, p.x, p.z, 0.40, 0.0, ph, step)
				if t >= 0.0:
					var head_t: float = SH2World.ray_cylinder(bpos, bdir, p.x, p.z, 0.22,
						ph - 0.30, ph, step)
					var is_head: bool = head_t >= 0.0 and head_t <= t + 0.0001
					game.damage_player(float(b["damage"]) * (2.1 if is_head else 1.0),
						b["owner"], "head" if is_head else "bullet")
					game.fx.impact(bpos + bdir * t, -bdir, true)
					dead = true
					break
			bpos += bdir * step
			b["traveled"] = float(b["traveled"]) + step
			if float(b["traveled"]) > float(b["max_dist"]):
				dead = true
				break
		b["pos"] = bpos
		if not dead:
			game.fx.tracer(bpos, bpos + bdir * 3.2, b["tracer"])
		if dead or float(b["life"]) <= 0.0:
			bullets.remove_at(i)


func _update_grenades(dt: float) -> void:
	for i in range(grenades.size() - 1, -1, -1):
		var gr: Dictionary = grenades[i]
		gr["fuse"] = float(gr["fuse"]) - dt
		var vel: Vector3 = gr["vel"]
		vel.y -= 14.0 * dt
		var pos: Vector3 = gr["pos"]
		pos += vel * dt
		if pos.y < 0.12:
			pos.y = 0.12
			vel.y *= -0.42
			vel.x *= 0.7
			vel.z *= 0.7
		var flat := Vector2(pos.x, pos.z)
		if game.world.resolve_circle(flat, 0.16):
			vel.x *= -0.5
			vel.z *= -0.5
		pos.x = flat.x
		pos.z = flat.y
		gr["vel"] = vel
		gr["pos"] = pos
		if gr["node"] == null:
			var sphere := SphereMesh.new()
			sphere.radius = 0.10
			sphere.height = 0.20
			sphere.radial_segments = 8
			sphere.rings = 6
			var mat := StandardMaterial3D.new()
			mat.albedo_color = Color(0.17, 0.23, 0.17)
			mat.metallic = 0.5
			sphere.material = mat
			var node := MeshInstance3D.new()
			node.mesh = sphere
			game.world_root.add_child(node)
			gr["node"] = node
		var node: Node3D = gr["node"]
		node.global_position = pos
		node.rotation.x += dt * 9.0
		if float(gr["fuse"]) <= 0.0:
			explode(gr)
			if is_instance_valid(node):
				node.queue_free()
			grenades.remove_at(i)


func explode(gr: Dictionary) -> void:
	var pos: Vector3 = gr["pos"]
	var radius: float = float(gr["radius"])
	var damage: float = float(gr["damage"])
	var from_player: bool = bool(gr["from_player"])
	game.fx.explosion(pos, radius)
	game.audio.explosion(pos.x, pos.z)
	game.shake(0.7)

	var p = game.player
	var d_p: float = Vector2(p.x - pos.x, p.z - pos.z).length()
	if p.alive and d_p < radius:
		var falloff: float = 1.0 - d_p / radius
		game.damage_player(damage * falloff * (0.35 if from_player else 1.0),
			gr["owner"], "explosion")
		p.vx += (p.x - pos.x) / maxf(0.4, d_p) * 6.0 * falloff
		p.vz += (p.z - pos.z) / maxf(0.4, d_p) * 6.0 * falloff

	if game.mission.get("type", "") == "destroy":
		game.damage_objective(pos.x, pos.z, damage * 0.85)

	for e in game.enemies:
		if not e.alive:
			continue
		var d: float = Vector2(e.x - pos.x, e.z - pos.z).length()
		if d < radius and game.world.has_los(Vector3(e.x, 1.0, e.z),
				Vector3(pos.x, pos.y + 0.2, pos.z)):
			var falloff: float = 1.0 - d / radius
			var dir := Vector3((e.x - pos.x) / maxf(0.01, d), 0.0, (e.z - pos.z) / maxf(0.01, d))
			e.take_damage(game, int(round(damage * falloff)), gr["owner"], "body",
				Vector3(e.x, 1.0, e.z), dir * (6.0 * falloff))
