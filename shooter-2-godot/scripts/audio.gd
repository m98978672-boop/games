extends Node
class_name SH2Audio
## СЕКТОР «ПЕПЕЛ» — звук без внешних ассетов.
##
## Как в вебе (Web Audio API), только на стороне Godot: шумы и тоны
## синтезируются в PCM-буферы при старте, дальше играются через
## AudioStreamPlayer3D (позиционные) и пул обычных плееров (интерфейс).
## Бюджет голосов тот же: не больше 24 одновременно.

const RATE: int = 22050
const MAX_VOICES: int = 24

var enabled: bool = true
var voices: int = 0
var streams: Dictionary = {}
var pool_2d: Array = []
var pool_3d: Array = []
var cursor_2d: int = 0
var cursor_3d: int = 0
var listener := Vector2.ZERO
var listener_yaw: float = 0.0
var danger: float = 0.0
var played: int = 0


func _ready() -> void:
	for i in 10:
		var p := AudioStreamPlayer.new()
		p.bus = "Master"
		add_child(p)
		pool_2d.append(p)
	for i in 14:
		var p3 := AudioStreamPlayer3D.new()
		p3.bus = "Master"
		p3.max_distance = 70.0
		p3.unit_size = 8.0
		p3.attenuation_model = AudioStreamPlayer3D.ATTENUATION_INVERSE_DISTANCE
		add_child(p3)
		pool_3d.append(p3)
	_build_streams()


## -------------------------- синтез буферов -------------------------------
static func _one_pole(x: float, state: float, a: float) -> float:
	return state + a * (x - state)


func _synth_noise(dur: float, kind: String, freq: float, _q: float, gain: float,
		decay: bool) -> PackedFloat32Array:
	var n: int = int(dur * RATE)
	var out := PackedFloat32Array()
	out.resize(n)
	var a_lp: float = clampf(1.0 - exp(-TAU * freq / float(RATE)), 0.0005, 1.0)
	var a_hp: float = clampf(1.0 - exp(-TAU * maxf(120.0, freq * 0.25) / float(RATE)), 0.0005, 1.0)
	var lp := 0.0
	var hp := 0.0
	var amp: float = gain
	for i in n:
		var t: float = float(i) / float(RATE)
		var x: float = randf() * 2.0 - 1.0
		var env: float = pow(0.0001 / maxf(0.0001, gain), t / maxf(0.001, dur))
		var sample := 0.0
		if kind == "lowpass":
			lp = _one_pole(x, lp, a_lp)
			sample = lp
		elif kind == "highpass":
			lp = _one_pole(x, lp, a_hp)
			sample = x - lp
		elif kind == "bandpass":
			lp = _one_pole(x, lp, a_lp)
			hp = _one_pole(lp, hp, a_hp)
			sample = lp - hp
		else:
			sample = x
		if decay:
			# срез уползает вниз — выстрел «глохнет»
			var k: float = 1.0 - t / maxf(0.001, dur)
			sample = sample * (0.35 + k * 0.65)
		out[i] = sample * amp * env
	return out


func _synth_tone(freq: float, dur: float, gain: float, wave: String,
		slide_to: float = 0.0) -> PackedFloat32Array:
	var n: int = int(dur * RATE)
	var out := PackedFloat32Array()
	out.resize(n)
	var phase := 0.0
	for i in n:
		var t: float = float(i) / float(RATE)
		var f: float = freq
		if slide_to > 0.0:
			f = freq * pow(slide_to / freq, t / maxf(0.001, dur))
		phase += TAU * f / float(RATE)
		var s: float = 0.0
		if wave == "square":
			s = 1.0 if sin(phase) >= 0.0 else -1.0
		elif wave == "sawtooth":
			s = fmod(phase / TAU, 1.0) * 2.0 - 1.0
		elif wave == "triangle":
			s = 2.0 * absf(fmod(phase / TAU, 1.0) * 2.0 - 1.0) - 1.0
		else:
			s = sin(phase)
		var env: float = pow(0.0001 / maxf(0.0001, gain), t / maxf(0.001, dur))
		out[i] = s * gain * env
	return out


func _mix(a: PackedFloat32Array, b: PackedFloat32Array) -> PackedFloat32Array:
	var n: int = maxi(a.size(), b.size())
	var out := PackedFloat32Array()
	out.resize(n)
	for i in n:
		var v := 0.0
		if i < a.size():
			v += a[i]
		if i < b.size():
			v += b[i]
		out[i] = clampf(v, -1.0, 1.0)
	return out


func _to_wav(samples: PackedFloat32Array) -> AudioStreamWAV:
	var bytes := PackedByteArray()
	bytes.resize(samples.size() * 2)
	for i in samples.size():
		var v: int = int(clampf(samples[i], -1.0, 1.0) * 32767.0)
		bytes.encode_s16(i * 2, v)
	var wav := AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_16_BITS
	wav.mix_rate = RATE
	wav.stereo = false
	wav.data = bytes
	return wav


func _build_streams() -> void:
	# выстрелы: шум + низкий тон
	streams["shot_pistol"] = _to_wav(_mix(
		_synth_noise(0.16, "lowpass", 2200.0, 0.8, 0.42, true),
		_synth_tone(180.0, 0.10, 0.22, "square", 70.0)))
	streams["shot_smg"] = _to_wav(_mix(
		_synth_noise(0.10, "bandpass", 1800.0, 1.2, 0.30, true),
		_synth_tone(240.0, 0.07, 0.14, "square", 110.0)))
	streams["shot_rifle"] = _to_wav(_mix(
		_synth_noise(0.19, "lowpass", 2600.0, 0.9, 0.46, true),
		_synth_tone(140.0, 0.13, 0.26, "sawtooth", 52.0)))
	streams["shot_shotgun"] = _to_wav(_mix(
		_synth_noise(0.30, "lowpass", 1500.0, 0.7, 0.55, true),
		_synth_tone(95.0, 0.20, 0.30, "square", 44.0)))
	streams["shot_dmr"] = _to_wav(_mix(
		_synth_noise(0.26, "lowpass", 3000.0, 1.1, 0.50, true),
		_synth_tone(120.0, 0.18, 0.30, "sawtooth", 40.0)))

	streams["dry_fire"] = _to_wav(_mix(
		_synth_tone(900.0, 0.03, 0.10, "square"),
		_synth_tone(1600.0, 0.02, 0.06, "square")))
	streams["reload"] = _to_wav(_mix(
		_mix(_synth_tone(420.0, 0.05, 0.12, "square"),
			_synth_tone(520.0, 0.04, 0.10, "square")),
		_synth_tone(260.0, 0.06, 0.10, "square")))
	streams["footstep"] = _to_wav(_synth_noise(0.09, "lowpass", 500.0, 0.8, 0.10, false))
	streams["hitmarker"] = _to_wav(_mix(
		_synth_tone(1500.0, 0.045, 0.09, "square"),
		_synth_tone(2100.0, 0.03, 0.06, "sine")))
	streams["headshot"] = _to_wav(_mix(
		_synth_tone(2400.0, 0.06, 0.12, "sine"),
		_synth_tone(1200.0, 0.09, 0.08, "triangle")))
	streams["hurt"] = _to_wav(_mix(
		_synth_noise(0.20, "lowpass", 700.0, 1.2, 0.30, true),
		_synth_tone(90.0, 0.20, 0.18, "sawtooth")))
	streams["explosion"] = _to_wav(_mix(
		_synth_noise(0.55, "lowpass", 900.0, 0.8, 0.75, true),
		_synth_tone(62.0, 0.40, 0.40, "sawtooth", 28.0)))
	streams["throw"] = _to_wav(_synth_noise(0.14, "highpass", 900.0, 0.7, 0.16, false))
	streams["melee"] = _to_wav(_synth_noise(0.12, "bandpass", 700.0, 1.4, 0.24, true))
	streams["radio"] = _to_wav(_mix(_synth_tone(680.0, 0.06, 0.05, "square"),
		_synth_tone(940.0, 0.05, 0.04, "square")))
	streams["pickup"] = _to_wav(_mix(_synth_tone(620.0, 0.09, 0.12, "triangle"),
		_synth_tone(930.0, 0.11, 0.10, "triangle")))
	streams["objective"] = _to_wav(_mix(_synth_tone(520.0, 0.12, 0.14, "sine"),
		_synth_tone(780.0, 0.16, 0.12, "sine")))
	streams["complete"] = _to_wav(_mix(_mix(
		_synth_tone(520.0, 0.16, 0.16, "sine"), _synth_tone(660.0, 0.22, 0.14, "sine")),
		_synth_tone(880.0, 0.30, 0.12, "sine")))
	streams["fail"] = _to_wav(_mix(_mix(
		_synth_tone(300.0, 0.24, 0.18, "sawtooth", 180.0),
		_synth_tone(150.0, 0.34, 0.15, "square")),
		_synth_noise(0.30, "lowpass", 400.0, 0.8, 0.12, false)))
	streams["heartbeat"] = _to_wav(_mix(_synth_tone(58.0, 0.16, 0.22, "sine"),
		_synth_tone(48.0, 0.20, 0.16, "sine")))
	streams["casing"] = _to_wav(_synth_tone(1700.0, 0.05, 0.05, "triangle"))


## ------------------------------ воспроизведение ---------------------------
func set_enabled(v: bool) -> void:
	enabled = v
	if not enabled:
		for p in pool_2d:
			(p as AudioStreamPlayer).stop()
		for p in pool_3d:
			(p as AudioStreamPlayer3D).stop()
		voices = 0


func set_listener(x: float, z: float, yaw: float) -> void:
	listener = Vector2(x, z)
	listener_yaw = yaw


func _budget() -> bool:
	return enabled and voices < MAX_VOICES


func play(key: String, volume_db: float = -6.0, pitch: float = 1.0) -> void:
	if not _budget() or not streams.has(key):
		return
	var p: AudioStreamPlayer = pool_2d[cursor_2d % pool_2d.size()]
	cursor_2d += 1
	p.stream = streams[key]
	p.volume_db = volume_db
	p.pitch_scale = pitch
	p.play()
	voices += 1
	played += 1
	get_tree().create_timer(0.4).timeout.connect(_release)


func play_at(key: String, x: float, z: float, volume_db: float = -4.0,
		pitch: float = 1.0) -> void:
	if not _budget() or not streams.has(key):
		return
	var p: AudioStreamPlayer3D = pool_3d[cursor_3d % pool_3d.size()]
	cursor_3d += 1
	p.stream = streams[key]
	p.volume_db = volume_db
	p.pitch_scale = pitch
	p.global_position = Vector3(x, 1.2, z)
	p.play()
	voices += 1
	played += 1
	get_tree().create_timer(0.6).timeout.connect(_release)


func _release() -> void:
	voices = maxi(0, voices - 1)


## ------------------------------- обёртки ---------------------------------
func gunshot(kind: String, x: float, z: float, vol: float = 1.0) -> void:
	var key: String = "shot_" + kind
	if not streams.has(key):
		key = "shot_rifle"
	play_at(key, x, z, linear_to_db(clampf(vol, 0.05, 1.0)) - 3.0,
		0.94 + randf() * 0.12)


func footstep(x: float, z: float, vol: float = 0.3) -> void:
	play_at("footstep", x, z, linear_to_db(clampf(vol, 0.02, 1.0)) - 6.0,
		0.9 + randf() * 0.2)


func reload_sfx(x: float, z: float) -> void:
	play_at("reload", x, z, -8.0)


func throw_grenade(x: float, z: float) -> void:
	play_at("throw", x, z, -6.0)


func melee_sfx(x: float, z: float) -> void:
	play_at("melee", x, z, -5.0)


func explosion(x: float, z: float) -> void:
	play_at("explosion", x, z, 1.0)


func hitmarker() -> void:
	play("hitmarker", -9.0)


func headshot() -> void:
	play("headshot", -7.0)


func hurt() -> void:
	play("hurt", -5.0)


func radio() -> void:
	play("radio", -12.0)


func pickup() -> void:
	play("pickup", -9.0)


func objective() -> void:
	play("objective", -7.0)


func mission_complete() -> void:
	play("complete", -5.0)


func mission_fail() -> void:
	play("fail", -4.0)


func heartbeat() -> void:
	play("heartbeat", -10.0)


func dry_fire() -> void:
	play("dry_fire", -10.0)


func casing() -> void:
	play("casing", -14.0)


func set_danger(level: float) -> void:
	danger = clampf(level, 0.0, 1.0)
