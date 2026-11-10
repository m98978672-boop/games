class_name TimeWeatherSystem
extends Node
## Система времени суток, сезонов года и погоды на основе реальных климатических норм Луисвилла (NOAA/Wikipedia).

const SECONDS_PER_GAME_HOUR: float = 45.0  # 1 игровые сутки = 18 реальных минут
const DAYS_PER_SEASON: int = 30

var day: int = 1
var hour: float = 8.0
var weather_id: String = "clear"  # clear, cloudy, rain, storm, fog, snow
var ambient_temp_c: float = 20.0
var darkness: float = 0.0
var rain_intensity: float = 0.0
var snow_intensity: float = 0.0
var fog_intensity: float = 0.0

var _jan_temp_c: float = 1.6
var _july_temp_c: float = 26.3
var _weather_timer: float = 0.0
var _rng := RandomNumberGenerator.new()


func _ready() -> void:
	_jan_temp_c = DataDB.get_real_game_value("clim_jan_mean_temp_c", 1.6)
	_july_temp_c = DataDB.get_real_game_value("clim_july_mean_temp_c", 26.3)
	_rng.seed = 20261110
	_recompute_climate()


func tick(dt: float) -> void:
	var dh := dt / SECONDS_PER_GAME_HOUR
	hour += dh
	if hour >= 24.0:
		hour -= 24.0
		day += 1
	_weather_timer += dh
	if _weather_timer >= 4.0:
		_weather_timer = 0.0
		_roll_weather()
	_recompute_climate()
	EventBus.time_tick.emit(day, hour, get_season())


func get_season() -> String:
	var year_day := (day - 1) % (DAYS_PER_SEASON * 4)
	if year_day < DAYS_PER_SEASON:
		return "spring"
	if year_day < DAYS_PER_SEASON * 2:
		return "summer"
	if year_day < DAYS_PER_SEASON * 3:
		return "autumn"
	return "winter"


func _roll_weather() -> void:
	var season := get_season()
	var r := _rng.randf()
	var prev := weather_id
	if season == "winter":
		if r < 0.28:
			weather_id = "snow"
		elif r < 0.45:
			weather_id = "fog"
		elif r < 0.72:
			weather_id = "cloudy"
		else:
			weather_id = "clear"
	else:
		if r < 0.14:
			weather_id = "storm"
		elif r < 0.34:
			weather_id = "rain"
		elif r < 0.48:
			weather_id = "fog"
		elif r < 0.72:
			weather_id = "cloudy"
		else:
			weather_id = "clear"
	if weather_id != prev:
		EventBus.weather_changed.emit(weather_id, ambient_temp_c)


func _recompute_climate() -> void:
	# Сезонная синусоида между _jan_temp_c (день ~105 года, зима) и _july_temp_c (день ~45 лета)
	var season_phase := float((day - 1) % 120) / 120.0 * TAU
	var mean_season := (_july_temp_c + _jan_temp_c) * 0.5 + (_july_temp_c - _jan_temp_c) * 0.5 * sin(season_phase)
	var diurnal := 5.5 * sin((hour - 9.0) / 24.0 * TAU)
	var weather_mod := 0.0
	rain_intensity = 0.0
	snow_intensity = 0.0
	fog_intensity = 0.0

	match weather_id:
		"cloudy":
			weather_mod = -1.5
		"rain":
			weather_mod = -3.0
			rain_intensity = 0.65
		"storm":
			weather_mod = -4.5
			rain_intensity = 1.0
		"fog":
			weather_mod = -2.0
			fog_intensity = 0.85
		"snow":
			weather_mod = -6.0
			snow_intensity = 0.8

	ambient_temp_c = clampf(mean_season + diurnal + weather_mod, -18.0, 40.0)

	# Кривая темноты: ночь 21:00..05:30, сумерки на рассвете/закате
	if hour >= 6.5 and hour <= 19.5:
		darkness = 0.0
	elif hour > 19.5 and hour < 21.5:
		darkness = (hour - 19.5) / 2.0 * 0.86
	elif hour >= 5.0 and hour < 6.5:
		darkness = (6.5 - hour) / 1.5 * 0.86
	else:
		darkness = 0.86
	if weather_id == "storm":
		darkness = minf(0.9, darkness + 0.18)


func get_ambient_noise_floor_db() -> float:
	if weather_id == "storm":
		return 64.0
	if weather_id == "rain":
		return 52.0
	if hour >= 22.0 or hour < 5.0:
		return 24.0
	return 34.0


func serialize_state() -> Dictionary:
	return {"day": day, "hour": hour, "weather_id": weather_id, "ambient_temp_c": ambient_temp_c}


func deserialize_state(d: Dictionary) -> void:
	day = int(d.get("day", 1))
	hour = float(d.get("hour", 8.0))
	weather_id = String(d.get("weather_id", "clear"))
	_recompute_climate()
