class_name AssetPack10K
extends RefCounted
## Детерминированный процедурный генератор 10 000 текстур, 2D-моделек и 3D-мешей для Dead District (Godot 4.3+).
## 0..3999 — 4 000 текстур 32x32, 4000..6999 — 3 000 спрайт-моделек 32x32, 7000..9999 — 3 000 3D ArrayMesh.

const TOTAL_COUNT: int = 10000
const TEXTURE_COUNT: int = 4000
const MODEL_COUNT: int = 3000
const MESH_COUNT: int = 3000

const PALETTE_HEX: Array[String] = [
	"#cea19d", "#9e6363", "#71353f", "#4f1b30", "#380e27",
	"#c9cb9f", "#a99a73", "#805947", "#623333", "#471f1f",
	"#95bf91", "#679a73", "#41745a", "#20494b", "#0f2935",
	"#96a5bc", "#6f779e", "#514a78", "#402c56", "#351740",
	"#b29cc3", "#a278ad", "#8b5084", "#693054", "#5a2033",
	"#b7c0c7", "#8c929e", "#5c6174", "#403e52", "#2d2738",
	"#ffffff", "#000000"
]

const TEX_FAMILY_NAMES: Array[String] = [
	"Кирпичная кладка", "Деревянный пол", "Дорожный асфальт", "Почва и трава",
	"Грунт и грязь", "Кафель и клиника", "Бетон и склады", "Вода и водоёмы",
	"Брус и заслоны", "Штукатурка и обои", "Лист и профнастил", "Следы боя и кровь",
	"Кора и древесина", "Снег и наледь", "Кровля и шифер", "Брезент и ткань",
	"Стекло и витрины", "Пашня и грядки", "Листва и крона", "Тротуар и брусчатка"
]

const MODEL_FAMILY_NAMES: Array[String] = [
	"Выживший", "Зомби-ходок", "Зомби-бегун", "Громила и ползун", "NPC и фракции",
	"Холодное оружие", "Огнестрельное оружие", "Патроны и обоймы", "Медицина", "Продукты и вода",
	"Инструменты", "Автозапчасти и ГСМ", "Одежда и броня", "Рюкзаки и ящики", "Семена и трофеи"
]

const MESH_FAMILY_NAMES: Array[String] = [
	"Легковой седан", "Спецтранспорт", "Пикап и джип", "Фургон и скорая", "Грузовик",
	"Дерево дуб", "Хвойное дерево", "Баррикада", "Костёр и очаг", "Генератор и станок",
	"Мебель", "Уличный объект", "Ящик и бочка", "3D модель оружия", "Малая постройка"
]

const VARIANT_TAGS: Array[String] = [
	"стандартный", "потёртый", "ржавый", "запылённый", "дождливый",
	"обгорелый", "укреплённый", "мшистый", "заснеженный", "кровавый",
	"военный", "гражданский", "полевой", "заводской", "клинический",
	"аварийный", "ночной", "выцветший", "тактический", "ветхий"
]


static func _hash32(a: int, b: int, c: int) -> int:
	var h: int = (a * 374761393 + b * 668265263 + c * 1442695041) & 0x7FFFFFFF
	h = ((h ^ (h >> 13)) * 1274126177) & 0x7FFFFFFF
	return (h ^ (h >> 16)) & 0x7FFFFFFF


static func _pal(idx: int) -> Color:
	return Color(PALETTE_HEX[posmod(idx, PALETTE_HEX.size())])


static func get_metadata(index: int) -> Dictionary:
	var idx := clampi(index, 0, TOTAL_COUNT - 1)
	if idx < TEXTURE_COUNT:
		var fam := idx / 200
		var rem := idx % 200
		var arch := rem / 20
		var vari := rem % 20
		return {
			"index": idx,
			"code": "TEX-%04d" % (idx + 1),
			"kind": "texture",
			"family": TEX_FAMILY_NAMES[fam % TEX_FAMILY_NAMES.size()],
			"name": "%s #%d (%s)" % [TEX_FAMILY_NAMES[fam % TEX_FAMILY_NAMES.size()], arch + 1, VARIANT_TAGS[vari]],
			"specs": "32x32 px"
		}
	elif idx < TEXTURE_COUNT + MODEL_COUNT:
		var m_idx := idx - TEXTURE_COUNT
		var mfam := m_idx / 200
		var mrem := m_idx % 200
		var march := mrem / 20
		var mvari := mrem % 20
		return {
			"index": idx,
			"code": "MOD-%04d" % (m_idx + 1),
			"kind": "model",
			"family": MODEL_FAMILY_NAMES[mfam % MODEL_FAMILY_NAMES.size()],
			"name": "%s #%d (%s)" % [MODEL_FAMILY_NAMES[mfam % MODEL_FAMILY_NAMES.size()], march + 1, VARIANT_TAGS[mvari]],
			"specs": "32x32 px 1px контур"
		}
	else:
		var g_idx := idx - TEXTURE_COUNT - MODEL_COUNT
		var gfam := g_idx / 200
		var grem := g_idx % 200
		var garch := grem / 20
		var gvari := grem % 20
		return {
			"index": idx,
			"code": "MESH-%04d" % (g_idx + 1),
			"kind": "mesh",
			"family": MESH_FAMILY_NAMES[gfam % MESH_FAMILY_NAMES.size()],
			"name": "%s #%d (%s)" % [MESH_FAMILY_NAMES[gfam % MESH_FAMILY_NAMES.size()], garch + 1, VARIANT_TAGS[gvari]],
			"specs": "3D ArrayMesh"
		}


static func get_page(page: int, page_size: int = 24, kind_filter: String = "all") -> Array[Dictionary]:
	var out: Array[Dictionary] = []
	var start_idx := 0
	var end_idx := TOTAL_COUNT
	if kind_filter == "texture":
		end_idx = TEXTURE_COUNT
	elif kind_filter == "model":
		start_idx = TEXTURE_COUNT
		end_idx = TEXTURE_COUNT + MODEL_COUNT
	elif kind_filter == "mesh":
		start_idx = TEXTURE_COUNT + MODEL_COUNT

	var from_i := mini(end_idx, start_idx + maxi(0, page) * page_size)
	var to_i := mini(end_idx, from_i + page_size)
	for i in range(from_i, to_i):
		out.append(get_metadata(i))
	return out


static func build_image(index: int) -> Image:
	var img := Image.create(32, 32, false, Image.FORMAT_RGBA8)
	var meta := get_metadata(index)
	var h := _hash32(index, 17, 91)
	if String(meta["kind"]) == "texture":
		var base := _pal(h % 29)
		var hi := _pal((h >> 5) % 29)
		var seam := _pal(29)
		img.fill(base)
		for y in range(32):
			for x in range(32):
				var v := _hash32(x, y, index) % 16
				if y % 8 == 0 or (x + (y / 8) * 8) % 16 == 0:
					img.set_pixel(x, y, seam)
				elif v < 3:
					img.set_pixel(x, y, hi)
	else:
		img.fill(Color(0, 0, 0, 0))
		var body_col := _pal(h % 28)
		var head_col := _pal((h >> 4) % 28)
		for y in range(11, 23):
			for x in range(10, 22):
				img.set_pixel(x, y, body_col)
		for y in range(5, 12):
			for x in range(12, 20):
				img.set_pixel(x, y, head_col)
		var blk := _pal(31)
		for y in range(32):
			for x in range(32):
				if img.get_pixel(x, y).a > 0.0:
					continue
				var edge := (x > 0 and img.get_pixel(x - 1, y).a > 0.9) or (x < 31 and img.get_pixel(x + 1, y).a > 0.9) or (y > 0 and img.get_pixel(x, y - 1).a > 0.9) or (y < 31 and img.get_pixel(x, y + 1).a > 0.9)
				if edge:
					img.set_pixel(x, y, blk)
	return img


static func build_texture(index: int) -> ImageTexture:
	return ImageTexture.create_from_image(build_image(index))


static func build_mesh(index: int) -> ArrayMesh:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var h := _hash32(index, 31, 7)
	var w := 0.8 + float(h % 10) * 0.1
	var hh := 0.6 + float((h >> 4) % 12) * 0.12
	var d := 0.8 + float((h >> 8) % 15) * 0.12
	_append_box(st, Vector3(0.0, hh * 0.5, 0.0), Vector3(w, hh, d), _pal(h % 28))
	_append_box(st, Vector3(0.0, hh + 0.25, 0.0), Vector3(w * 0.72, 0.5, d * 0.6), _pal(15))
	st.generate_normals()
	return st.commit()


static func _append_box(st: SurfaceTool, center: Vector3, size: Vector3, col: Color) -> void:
	var hs := size * 0.5
	var c := [
		center + Vector3(-hs.x, -hs.y, -hs.z),
		center + Vector3(hs.x, -hs.y, -hs.z),
		center + Vector3(hs.x, hs.y, -hs.z),
		center + Vector3(-hs.x, hs.y, -hs.z),
		center + Vector3(-hs.x, -hs.y, hs.z),
		center + Vector3(hs.x, -hs.y, hs.z),
		center + Vector3(hs.x, hs.y, hs.z),
		center + Vector3(-hs.x, hs.y, hs.z)
	]
	var quads := [
		[4, 5, 6, 7], [1, 0, 3, 2], [5, 1, 2, 6],
		[0, 4, 7, 3], [3, 7, 6, 2], [0, 1, 5, 4]
	]
	st.set_color(col)
	for q in quads:
		st.set_uv(Vector2(0, 0)); st.add_vertex(c[q[0]])
		st.set_uv(Vector2(1, 0)); st.add_vertex(c[q[1]])
		st.set_uv(Vector2(1, 1)); st.add_vertex(c[q[2]])
		st.set_uv(Vector2(0, 0)); st.add_vertex(c[q[0]])
		st.set_uv(Vector2(1, 1)); st.add_vertex(c[q[2]])
		st.set_uv(Vector2(0, 1)); st.add_vertex(c[q[3]])
