// Внешность тягачей: у каждой модели AURIGA свой обвес, а не только цвет.
// Геометрия кабины общая (её же использует салон и камера), а «характер»
// задаётся тем, что видно снаружи: высота крыши и обтекатели, решётка, фары,
// бампер, зеркала, юбки, число задних осей, выхлоп и крылья.
//
// Поля профиля:
//   roof        'low' | 'high' | 'mega' — высота спальной надстройки
//   deflector   'none' | 'low' | 'high' — лобовой обтекатель
//   roofLights  число жёлтых габаритов на козырьке крыши (0–5)
//   horns       пневмогудки на крыше
//   grille      'classic' | 'modern' | 'heavy'
//   lights      'halogen' | 'projector' | 'led' | 'quad'
//   bumper      'steel' | 'chrome' | 'paint'
//   mirrors     'classic' | 'aero'
//   skirts      боковые юбки под баками
//   rearAxles   1 — один задний мост (4×2), 2 — тандем (6×4)
//   exhaust     'side' | 'stack'
//   wheels      'steel' | 'alu'
//   fenders     'plastic' | 'paint'
//   tank        'alu' | 'paint' — материал топливных баков
//   chrome      хромированный пакет (ручки, молдинги, кронштейны)
//   led         светодиодная полоса дневного света
//   accent      цвет акцентной полосы на борту (0x…)

export const TRACTOR_LOOKS = {
  // Подержанный «рабочий» тягач первых рейсов: простая кабина, сталь, без обвеса.
  'auriga-3': {
    id: 'auriga-3',
    title: 'Auriga 3 · 4×2 · низкая кабина',
    roof: 'low',
    deflector: 'none',
    roofLights: 2,
    horns: false,
    grille: 'classic',
    lights: 'halogen',
    bumper: 'steel',
    mirrors: 'classic',
    skirts: false,
    rearAxles: 1,
    exhaust: 'side',
    wheels: 'steel',
    fenders: 'plastic',
    tank: 'paint',
    chrome: false,
    led: false,
    accent: 0x8a9096,
  },
  // Рабочая лошадка: высокая крыша, хром-пакет, юбки, обтекатель.
  'auriga-4': {
    id: 'auriga-4',
    title: 'Auriga 4 · 4×2 · высокая крыша',
    roof: 'high',
    deflector: 'low',
    roofLights: 3,
    horns: false,
    grille: 'modern',
    lights: 'projector',
    bumper: 'chrome',
    mirrors: 'classic',
    skirts: true,
    rearAxles: 1,
    exhaust: 'side',
    wheels: 'alu',
    fenders: 'plastic',
    tank: 'alu',
    chrome: true,
    led: false,
    accent: 0xe0c27a,
  },
  // Комфорт для дальних рейсов: мега-кабина, полный аэродинамический пакет.
  'auriga-5': {
    id: 'auriga-5',
    title: 'Auriga 5 · 4×2 · мега-кабина',
    roof: 'mega',
    deflector: 'high',
    roofLights: 5,
    horns: true,
    grille: 'modern',
    lights: 'led',
    bumper: 'chrome',
    mirrors: 'aero',
    skirts: true,
    rearAxles: 1,
    exhaust: 'side',
    wheels: 'alu',
    fenders: 'paint',
    tank: 'alu',
    chrome: true,
    led: true,
    accent: 0x5bd0c0,
  },
  // Флагман: тёмный глянец, светодиодная оптика, камеры вместо зеркал.
  'auriga-6': {
    id: 'auriga-6',
    title: 'Auriga 6 · 4×2 · флагман',
    roof: 'mega',
    deflector: 'high',
    roofLights: 5,
    horns: true,
    grille: 'modern',
    lights: 'led',
    bumper: 'paint',
    mirrors: 'aero',
    skirts: true,
    rearAxles: 1,
    exhaust: 'side',
    wheels: 'alu',
    fenders: 'paint',
    tank: 'alu',
    chrome: true,
    led: true,
    accent: 0x9fd0ff,
  },
  // Тяжёлый 6×4 для негабарита: тандем, вертикальные трубы, усиленный бампер.
  'auriga-6x': {
    id: 'auriga-6x',
    title: 'Auriga 6X · 6×4 · тяжёлый',
    roof: 'mega',
    deflector: 'low',
    roofLights: 5,
    horns: true,
    grille: 'heavy',
    lights: 'quad',
    bumper: 'steel',
    mirrors: 'classic',
    skirts: false,
    rearAxles: 2,
    exhaust: 'stack',
    wheels: 'steel',
    fenders: 'plastic',
    tank: 'alu',
    chrome: true,
    led: false,
    accent: 0xd8632f,
  },
};

/** Профиль внешности по идентификатору модели; запасной — «рабочая лошадка». */
export function lookFor(modelId) {
  return TRACTOR_LOOKS[modelId] || TRACTOR_LOOKS['auriga-4'];
}
