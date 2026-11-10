class_name WorldRenderer3D
extends Node2D
## Гибридный рендерер 2D пиксель-арт + 3D low-poly окружение:
## - 3D сцена (машины, мебель, деревья, оружие, динамический свет и тени) внутри SubViewport (480x270)
## - Вывод на экран через SubViewportContainer с TEXTURE_FILTER_NEAREST (апскейл x4 до 1920x1080)
## - Постобработка шейдером квантования палитры Survival Horror 32 и 2D слоями тайлов/FOV/погоды.

const BASE_RES := Vector2i(480, 270)
const TILE_PX: int = 16

@export var subviewport_path: NodePath
@export var camera_3d_path: NodePath
@export var sun_light_path: NodePath
@export var props_3d_root_path: NodePath
@export var weather_overlay_path: NodePath
@export var vignette_overlay_path: NodePath

var chunk_streamer: ChunkStreamer
var time_weather: TimeWeatherSystem
var visible_tiles: Dictionary = {}
var explored_tiles: Dictionary = {}
var player_tile_pos: Vector2 = Vector2(16, 16)
var active_zombies: Array[Dictionary] = []
var active_npcs: Array[Dictionary] = []
var farm_plots: Array[Dictionary] = []
var vehicles_data: Array[Dictionary] = []
var noise_rings: Array[Dictionary] = []

var _3d_vehicle_nodes: Dictionary = {}
var _3d_prop_nodes: Dictionary = {}


func setup(p_chunks: ChunkStreamer, p_weather: TimeWeatherSystem) -> void:
	chunk_streamer = p_chunks
	time_weather = p_weather
	_ensure_subviewport_size()


func _ensure_subviewport_size() -> void:
	var sv := get_node_or_null(subviewport_path) as SubViewport
	if sv != null and sv.size != BASE_RES:
		ErrorManager.warn("E801", "WorldRenderer3D", "Исправлен размер SubViewport до 480x270", {"was": sv.size})
		sv.size = BASE_RES


func sync_3d_scene(player_pos: Vector2, p_vehicles: Array[Dictionary], p_darkness: float) -> void:
	player_tile_pos = player_pos
	var cam := get_node_or_null(camera_3d_path) as Camera3D
	if cam != null:
		# Ортографическая камера выровнена 1:1 с сеткой 2D тайлов (270/16 = 16.875)
		cam.position = Vector3(player_pos.x, 22.0, player_pos.y)
		cam.rotation_degrees = Vector3(-90.0, 0.0, 0.0)

	var sun := get_node_or_null(sun_light_path) as DirectionalLight3D
	if sun != null:
		sun.light_energy = lerpf(1.15, 0.12, p_darkness)
		sun.rotation_degrees = Vector3(-55.0, -35.0 + p_darkness * 40.0, 0.0)

	var props_root := get_node_or_null(props_3d_root_path) as Node3D
	if props_root != null:
		for v in p_vehicles:
			var vid := String(v["id"])
			if not _3d_vehicle_nodes.has(vid):
				var vtype := String(v.get("type", "veh_sedan"))
				var glb_path := "res://assets/models/%s.glb" % vtype
				var node3d: Node3D = null
				if ResourceLoader.exists(glb_path):
					var packed := load(glb_path) as PackedScene
					if packed != null:
						node3d = packed.instantiate() as Node3D
				if node3d == null:
					var mesh_inst := MeshInstance3D.new()
					var box := BoxMesh.new()
					box.size = Vector3(2.0, 1.3, 4.2)
					mesh_inst.mesh = box
					var mat := StandardMaterial3D.new()
					mat.albedo_color = Color.html("#71353f") if vtype == "veh_ambulance" else Color.html("#5c6174")
					mat.shading_mode = BaseMaterial3D.SHADING_MODE_PER_PIXEL
					mesh_inst.material_override = mat
					node3d = mesh_inst
				props_root.add_child(node3d)
				_3d_vehicle_nodes[vid] = node3d
			var node := _3d_vehicle_nodes[vid] as Node3D
			var vp: Vector2 = v["pos"]
			node.position = Vector3(vp.x, 0.65, vp.y)
			node.rotation.y = -float(v.get("angle", 0.0))

	_update_weather_shaders()
	queue_redraw()


func _update_weather_shaders() -> void:
	if time_weather == null:
		return
	var w_rect := get_node_or_null(weather_overlay_path) as ColorRect
	if w_rect != null and w_rect.material is ShaderMaterial:
		var sm := w_rect.material as ShaderMaterial
		sm.set_shader_parameter("darkness", time_weather.darkness)
		sm.set_shader_parameter("rain_intensity", time_weather.rain_intensity)
		sm.set_shader_parameter("snow_intensity", time_weather.snow_intensity)
		sm.set_shader_parameter("fog_intensity", time_weather.fog_intensity)


func update_vignette(blood_pct: float, cold_pct: float, panic_pct: float) -> void:
	var v_rect := get_node_or_null(vignette_overlay_path) as ColorRect
	if v_rect != null and v_rect.material is ShaderMaterial:
		var sm := v_rect.material as ShaderMaterial
		sm.set_shader_parameter("blood_level", blood_pct)
		sm.set_shader_parameter("cold_level", cold_pct)
		sm.set_shader_parameter("panic_level", panic_pct)


func add_noise_ring(pos: Vector2, radius_tiles: float) -> void:
	noise_rings.append({"pos": pos, "r": radius_tiles, "ttl": 0.45})


func _process(delta: float) -> void:
	var alive: Array[Dictionary] = []
	for nr in noise_rings:
		nr["ttl"] = float(nr["ttl"]) - delta
		if float(nr["ttl"]) > 0.0:
			alive.append(nr)
	noise_rings = alive


func _draw() -> void:
	if chunk_streamer == null:
		return
	var half_w := int(BASE_RES.x / TILE_PX / 2) + 2
	var half_h := int(BASE_RES.y / TILE_PX / 2) + 2
	var center := Vector2i(int(round(player_tile_pos.x)), int(round(player_tile_pos.y)))
	var origin_px := Vector2(BASE_RES) * 0.5 - player_tile_pos * float(TILE_PX)

	# 1. Тайл-сетка в пикселях палитры Survival Horror 32 (без сглаживания)
	for ty in range(center.y - half_h, center.y + half_h + 1):
		for tx in range(center.x - half_w, center.x + half_w + 1):
			var t := Vector2i(tx, ty)
			var screen_pos := origin_px + Vector2(t) * float(TILE_PX)
			var rect := Rect2(screen_pos.floor(), Vector2(TILE_PX, TILE_PX))
			var is_vis := visible_tiles.has(t)
			var is_exp := explored_tiles.has(t)

			if not is_exp and not is_vis:
				draw_rect(rect, Color.html("#0f2935"))
				continue

			var ttype := chunk_streamer.get_tile(t)
			var col := _color_for_tile(ttype)
			if not is_vis:
				col = col.darkened(0.45)
			draw_rect(rect, col)
			if ttype == ProcGen.TileType.WALL_BRICK or ttype == ProcGen.TileType.WALL_WOOD or ttype == ProcGen.TileType.WALL_PLASTER:
				draw_rect(rect, Color.html("#000000"), false, 1.0)
			elif ttype == ProcGen.TileType.DOOR:
				var d := chunk_streamer.get_door(t)
				if not bool(d.get("open", false)):
					draw_rect(Rect2(rect.position + Vector2(2, 5), Vector2(TILE_PX - 4, 5)), Color.html("#805947"))

	# 2. Грядки фермы
	for fp in farm_plots:
		var ft: Vector2i = fp["tile"]
		if not visible_tiles.has(ft):
			continue
		var p := (origin_px + Vector2(ft) * float(TILE_PX)).floor()
		draw_rect(Rect2(p + Vector2(2, 2), Vector2(12, 12)), Color.html("#623333"))
		var stage := int(fp.get("stage", 0))
		if stage > 0:
			draw_rect(Rect2(p + Vector2(5, 5), Vector2(2 + stage * 2, 2 + stage * 2)), Color.html("#95bf91"))

	# 3. 3D-позиционированные машины (2D силуэт + 1px обводка поверх для согласования)
	for v in vehicles_data:
		var vp: Vector2 = v["pos"]
		var p := (origin_px + vp * float(TILE_PX)).floor()
		draw_rect(Rect2(p - Vector2(12, 8), Vector2(24, 16)), Color.html("#5c6174"))
		draw_rect(Rect2(p - Vector2(12, 8), Vector2(24, 16)), Color.html("#000000"), false, 1.0)

	# 4. Зомби (активные)
	for z in active_zombies:
		if String(z.get("state", "")) == "DEAD":
			continue
		var zt := Vector2i(int(round(z["pos"].x)), int(round(z["pos"].y)))
		if not visible_tiles.has(zt):
			continue
		var p := (origin_px + z["pos"] * float(TILE_PX)).floor()
		var zcol := Color.html("#679a73")
		if String(z["type"]) == "brute":
			zcol = Color.html("#71353f")
		elif String(z["type"]) == "infected":
			zcol = Color.html("#95bf91")
		elif String(z["type"]) == "runner":
			zcol = Color.html("#9e6363")
		draw_rect(Rect2(p - Vector2(5, 6), Vector2(10, 12)), Color.html("#000000"))
		draw_rect(Rect2(p - Vector2(4, 5), Vector2(8, 10)), zcol)

	# 5. Выжившие NPC
	for n in active_npcs:
		var nt := Vector2i(int(round(n["pos"].x)), int(round(n["pos"].y)))
		if not visible_tiles.has(nt):
			continue
		var p := (origin_px + n["pos"] * float(TILE_PX)).floor()
		var ncol := Color.html("#96a5bc") if float(n.get("hostility", 0.0)) < 0.5 else Color.html("#8b5084")
		draw_rect(Rect2(p - Vector2(5, 6), Vector2(10, 12)), Color.html("#000000"))
		draw_rect(Rect2(p - Vector2(4, 5), Vector2(8, 10)), ncol)

	# 6. Персонаж игрока в центре
	var player_px := Vector2(BASE_RES) * 0.5
	draw_rect(Rect2(player_px - Vector2(5, 6), Vector2(10, 12)), Color.html("#000000"))
	draw_rect(Rect2(player_px - Vector2(4, 5), Vector2(8, 10)), Color.html("#ffffff"))

	# 7. Звуковые волны
	for nr in noise_rings:
		var p := (origin_px + nr["pos"] * float(TILE_PX)).floor()
		var rad := clampf(float(nr["r"]) * float(TILE_PX) * (1.0 - float(nr["ttl"])), 4.0, 160.0)
		draw_arc(p, rad, 0.0, TAU, 24, Color.html("#c9cb9f"), 1.0)


func _color_for_tile(t: int) -> Color:
	match t:
		ProcGen.TileType.GRASS:
			return Color.html("#41745a")
		ProcGen.TileType.DIRT:
			return Color.html("#805947")
		ProcGen.TileType.ASPHALT:
			return Color.html("#403e52")
		ProcGen.TileType.SIDEWALK:
			return Color.html("#8c929e")
		ProcGen.TileType.FLOOR_WOOD:
			return Color.html("#a99a73")
		ProcGen.TileType.FLOOR_HOSPITAL:
			return Color.html("#b7c0c7")
		ProcGen.TileType.FLOOR_WAREHOUSE:
			return Color.html("#5c6174")
		ProcGen.TileType.WATER:
			return Color.html("#20494b")
		ProcGen.TileType.WALL_BRICK:
			return Color.html("#623333")
		ProcGen.TileType.WALL_WOOD:
			return Color.html("#471f1f")
		ProcGen.TileType.WALL_PLASTER:
			return Color.html("#cea19d")
		ProcGen.TileType.DOOR:
			return Color.html("#805947")
		ProcGen.TileType.WINDOW:
			return Color.html("#96a5bc")
		ProcGen.TileType.TREE_OAK, ProcGen.TileType.TREE_PINE:
			return Color.html("#20494b")
	return Color.html("#2d2738")
