class_name NoiseSystem
extends Node
## Система распространения звука:
## - закон обратных квадратов I = P / (4*pi*r^2) -> -6.02 дБ за каждое удвоение расстояния (data/real/climate.json)
## - ослабление стенами (-12 дБ/стена, -5 дБ/дверь) по дискретному лучу DDA
## - маскировка текущим фоновым шумом погоды/времени суток.

const HEARING_THRESHOLD_DB: float = 32.0
const WALL_ATTENUATION_DB: float = 12.0
const DOOR_ATTENUATION_DB: float = 5.0

var _doubling_loss_db: float = 6.02


func _ready() -> void:
	_doubling_loss_db = DataDB.get_real_game_value("acoustics_inverse_square_attenuation", 6.02)


func compute_max_radius_tiles(source_db_at_1m: float, ambient_floor_db: float) -> float:
	if is_nan(source_db_at_1m) or source_db_at_1m <= 0.0:
		ErrorManager.warn("E804", "NoiseSystem", "Некорректный уровень шума дБ", {"db": source_db_at_1m})
		return 0.0
	var eff_floor := maxf(HEARING_THRESHOLD_DB, ambient_floor_db)
	var delta_db := source_db_at_1m - eff_floor
	if delta_db <= 0.0:
		return 0.0
	# dB(r) = dB(1m) - 20 * log10(r)  => r = 10^(delta_db / 20)
	var doublings := delta_db / _doubling_loss_db
	return clampf(pow(2.0, doublings), 1.0, 140.0)


func compute_received_db(src_pos: Vector2, dst_pos: Vector2, source_db: float, chunks: ChunkStreamer) -> float:
	var dist := maxf(1.0, src_pos.distance_to(dst_pos))
	var dist_loss := _doubling_loss_db * (log(dist) / log(2.0))
	var wall_loss := _trace_wall_attenuation(src_pos, dst_pos, chunks)
	return source_db - dist_loss - wall_loss


func _trace_wall_attenuation(a: Vector2, b: Vector2, chunks: ChunkStreamer) -> float:
	if chunks == null:
		return 0.0
	var steps := int(ceil(a.distance_to(b)))
	if steps <= 1:
		return 0.0
	var loss := 0.0
	var last_tile := Vector2i(int(round(a.x)), int(round(a.y)))
	for i in range(1, steps):
		var p := a.lerp(b, float(i) / float(steps))
		var t := Vector2i(int(round(p.x)), int(round(p.y)))
		if t == last_tile:
			continue
		last_tile = t
		var tt := chunks.get_tile(t)
		if tt == ProcGen.TileType.WALL_BRICK or tt == ProcGen.TileType.WALL_WOOD or tt == ProcGen.TileType.WALL_PLASTER:
			loss += WALL_ATTENUATION_DB
		elif tt == ProcGen.TileType.DOOR and not bool(chunks.get_door(t).get("open", false)):
			loss += DOOR_ATTENUATION_DB
	return loss
