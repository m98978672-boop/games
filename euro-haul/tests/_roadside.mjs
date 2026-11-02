// Придорожные объекты не должны попадать на проезжую часть, тем более на встречную.
import { roadsideLat, EDGE_LEFT, EDGE_RIGHT } from '../src/world/road.js';
import { hash2 } from '../src/core/math.js';

// Полосы: наша −3.7…3.7 (обочина до −5.2), разделитель 3.7…5.3, встречная 5.3…12.7.
const ON_ROAD = (lat) => (lat > -5.2 && lat < 14.2);
const ON_ONCOMING = (lat) => lat > 5.2 && lat < 12.7;

// Те же формулы, что в road.js: трава, кусты, деревья.
const samples = [];
for (let i = 0; i < 4000; i++) {
  const side = hash2(i, 137) > 0.5 ? 1 : -1;
  const spread = 0.2 + hash2(i, 139) * 6.4 + (hash2(i, 141) > 0.86 ? 5.5 : 0);
  samples.push(['трава', roadsideLat(-side, spread)]);
  const side2 = hash2(i, 71) > 0.45 ? 1 : -1;
  samples.push(['куст', roadsideLat(-side2, 1.6 + hash2(i, 73) * 6)]);
  const side3 = hash2(i, 7) > 0.5 ? 1 : -1;
  const dist = 11 + hash2(i, 11) * 30 + (i % 6) * 3.4 + hash2(i, 13) * 14 + (hash2(i, 15) > 0.82 ? 60 : 0);
  samples.push(['дерево', roadsideLat(-side3, dist)]);
}

let bad = 0;
let onOncoming = 0;
for (const [kind, lat] of samples) {
  if (ON_ROAD(lat)) {
    bad++;
    if (bad < 5) console.log(`  ✗ ${kind} на проезжей части: lat=${lat.toFixed(2)}`);
  }
  if (ON_ONCOMING(lat)) onOncoming++;
}
if (bad || onOncoming) {
  console.error(`\n❌ растительность на дороге: ${bad} (из них на встречной: ${onOncoming})`);
  process.exit(1);
}
console.log(`  ✓ ${samples.length} объектов: ни один не попал на проезжую часть`);
console.log(`  ✓ кромки: наша ${EDGE_LEFT} м, встречная ${EDGE_RIGHT} м`);
console.log('\n✅ придорожная растительность вне полос');
