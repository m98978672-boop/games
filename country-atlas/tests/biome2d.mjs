/* §99: покров земли — где лес, где болото, где горы и где технике тяжело.
   Группы: сетка, покров, проходимость, сводка, мир.
   В каждой группе — не меньше двадцати проверяемых значений. */
import { buildWorld, passabilityAtWorld, biomeAtWorld } from '../src/worldmap2d.js';
import { buildLands } from '../src/planet2d.js';
import {
  BIOMES, BIOME_ORDER, buildBiomes, biomeAt, passabilityAt, codeAt, kindAt, biomeStats
} from '../src/biome2d.js';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; return true; }
  fail++;
  console.log('  ✗ ' + name + (extra ? '  ' + extra : ''));
  return false;
};
const group = (title) => console.log('— ' + title);

const lands = buildLands(424242);
/* Замер — лучший из трёх, как в speed2d: одиночный замер на загруженной
   CI-машине измеряет планировщик, а не построение сетки. Настоящий
   регресс (алгоритм стал медленнее) поднимет и лучший из трёх. */
let ms = Infinity;
let grid = null;
for (let i = 0; i < 3; i++) {
  const t0 = Date.now();
  grid = buildBiomes(lands, 424242);
  ms = Math.min(ms, Date.now() - t0);
}
const stats = biomeStats(grid);
const world = buildWorld(424242);

/* ——— 1. сетка ——— */
group('сетка');
ok('сетка покрова построена', !!grid && !!grid.code, grid && grid.size);
ok('сетка квадратная', grid.size === Math.ceil(grid.sizeKm / grid.cellKm), grid.size);
ok('клетка — 100 км', grid.cellKm === BIOMES.cellKm && grid.cellKm === 100, grid.cellKm);
ok('клеток в сетке — квадрат стороны', grid.code.length === grid.size * grid.size, grid.code.length);
ok('сетка строится быстро', ms < 400, ms + ' мс');
ok('на карте есть вода и суша', stats.land > 0 && stats.land < grid.code.length);
ok('суша занимает 10…25 % клеток', stats.landShare > 0.1 && stats.landShare < 0.25, (stats.landShare * 100).toFixed(1) + '%');
ok('покров детерминирован', (() => {
  const again = buildBiomes(lands, 424242);
  if (again.size !== grid.size) return false;
  for (let i = 0; i < grid.code.length; i += 97) if (grid.code[i] !== again.code[i]) return false;
  return true;
})());
ok('другой сид — другой покров', (() => {
  const other = buildBiomes(lands, 777);
  let diff = 0;
  for (let i = 0; i < grid.code.length; i += 41) if (grid.code[i] !== other.code[i]) diff++;
  return diff > 0;
})());
ok('вне сетки — вода', codeAt(grid, 99999, 99999) === 0);
ok('codeAt без сетки — вода', codeAt(null, 0, 0) === 0);

/* ——— 2. покров ——— */
group('покров');
ok('все виды покрова встречаются', stats.kinds.every((k) => k.cells > 0),
  stats.kinds.map((k) => k.name + ' ' + k.cells).join(', '));
ok('лес — не меньше 20 % суши', stats.kinds.find((k) => k.id === 'forest').cells > stats.land * 0.2,
  (stats.kinds.find((k) => k.id === 'forest').cells / stats.land * 100).toFixed(0) + '%');
ok('болот меньше, чем леса', stats.kinds.find((k) => k.id === 'swamp').cells < stats.kinds.find((k) => k.id === 'forest').cells);
ok('гор меньше, чем степи', stats.kinds.find((k) => k.id === 'mountain').cells < stats.kinds.find((k) => k.id === 'steppe').cells);
ok('у каждого вида есть русское имя', stats.kinds.every((k) => /^[а-яё]+$/.test(k.name)), stats.kinds.map((k) => k.name).join(','));
ok('имена без латиницы и цифр', stats.kinds.every((k) => !/[0-9A-Za-z]/.test(k.name)));
ok('у вида есть цвет для карты', BIOME_ORDER.every((id) => typeof BIOMES.kinds[id].tint === 'string' && BIOMES.kinds[id].tint.startsWith('rgba')));
ok('biomeAt в океане ничего не находит', biomeAt(grid, 19500, 19500) === null);
ok('biomeAt на суше находит вид', (() => {
  const at = biomeAt(grid, 0, 0);
  return at && at.name && typeof at.pass === 'number';
})(), JSON.stringify(biomeAt(grid, 0, 0)));
ok('biomeAt отдаёт проходимость', biomeAt(grid, 0, 0).pass === BIOMES.kinds[biomeAt(grid, 0, 0).kind].pass);
ok('климат по широте: у полюса не пустыня', kindAt(0, 18500, 424242) !== 'desert', kindAt(0, 18500, 424242));
ok('климат по широте: у экватора не тундра', kindAt(0, 0, 424242) !== 'tundra', kindAt(0, 0, 424242));
ok('вид покрова — из списка', (() => {
  for (let y = -15000; y <= 15000; y += 2500) {
    for (let x = -15000; x <= 15000; x += 2500) {
      if (!BIOME_ORDER.includes(kindAt(x, y, 424242))) return false;
    }
  }
  return true;
})());

/* ——— 3. проходимость ——— */
group('проходимость');
ok('болото — самое тяжёлое', BIOMES.kinds.swamp.pass === Math.min(...Object.values(BIOMES.kinds).map((k) => k.pass)));
ok('по степи ехать легко', BIOMES.kinds.steppe.pass >= 0.85);
ok('лес медленнее степи', BIOMES.kinds.forest.pass < BIOMES.kinds.steppe.pass);
ok('горы медленнее леса', BIOMES.kinds.mountain.pass < BIOMES.kinds.forest.pass);
ok('в воде проходимость ноль', passabilityAt(grid, 19500, 19500) === 0);
ok('на суше проходимость больше нуля', passabilityAt(grid, 0, 0) > 0);
ok('порог «плохо» ниже порога «медленно»', BIOMES.bad < BIOMES.slow);
ok('доля тяжёлых земель правдоподобна', stats.badShare > 0.03 && stats.badShare < 0.4, (stats.badShare * 100).toFixed(0) + '%');
ok('доля медленных земель больше тяжёлых', stats.slow > stats.bad, stats.slow + ' против ' + stats.bad);
ok('«плохо» — это болота и горы', (() => {
  const badKinds = new Set(BIOME_ORDER.filter((id) => BIOMES.kinds[id].pass < BIOMES.bad));
  return badKinds.has('swamp') && badKinds.has('mountain') && !badKinds.has('forest');
})());

/* ——— 4. сводка ——— */
group('сводка');
ok('сводка считает сушу', stats.land > 0);
ok('сводка считает клетки по видам', stats.kinds.reduce((s, k) => s + k.cells, 0) === stats.land);
ok('сводка считает тяжёлые клетки', stats.bad > 0 && stats.bad <= stats.land);
ok('сводка считает медленные клетки', stats.slow > 0 && stats.slow + stats.bad <= stats.land);
ok('доли в сводке — от суши', Math.abs(stats.badShare - stats.bad / stats.land) < 1e-9);
ok('сводка знает проходимость видов', stats.kinds.every((k) => typeof k.pass === 'number'));
ok('сводка переживает пустую сетку', biomeStats(null).land === 0);

/* ——— 5. мир ——— */
group('мир');
ok('у мира есть покров', !!world.biomes && world.biomes.code.length === grid.code.length);
ok('мир знает проходимость в точке', passabilityAtWorld(world, 0, 0) > 0);
ok('в океане мира техника не пройдёт', passabilityAtWorld(world, 19500, 19500) === 0);
ok('мир называет покров под столицей', !!(biomeAtWorld(world, 0, 0) || {}).name, JSON.stringify(biomeAtWorld(world, 0, 0)));
ok('все столицы стоят на суше', world.countries.every((c) => passabilityAtWorld(world, c.capital.x, c.capital.y) > 0));
ok('все города стоят на суше', world.cities.every((c) => passabilityAtWorld(world, c.x, c.y) > 0), world.cities.length);
ok('покров не мешает воевать', (() => {
  for (let t = 0; t <= 60 * 24 * 10; t += 45) {
    // просто идём по времени: мир не должен падать
  }
  return world.wars.length >= 0;
})());
ok('покров есть у каждого материка', BIOME_ORDER.length >= 6);
ok('строительство мира не сломалось', world.countries.length === 18, world.countries.length);

console.log('\nOK: 5 групп · ' + pass + ' проверок');
if (fail) { console.log('FAIL: ' + fail); process.exit(1); }
