// Execute the actual init callback with a controlled animation clock.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(__dirname + '/browser_bridge.cjs', 'utf8');
const start = source.indexOf('    await page.addInitScript(() => {');
const end = source.indexOf('\n    if (BOOTSTRAP === "voxel") {', start);
assert(start >= 0 && end > start);
const init = source.slice(start, end).replace('    await page.addInitScript(', '(').trim();
let callback, now = 0;
const sandbox = {window:{}, performance:{now:() => now}, requestAnimationFrame:fn => {callback=fn;}};
vm.runInNewContext(init.replace(/;$/, '') + '()', sandbox);
assert.equal(sandbox.window.__bridgeFrameTiming().samples, 0);
function frame(time) { now=time; callback(time); }
frame(0); frame(10000); frame(80000);
let data = sandbox.window.__bridgeFrameTiming();
assert.equal(data.samples, 2); assert.equal(data.max_ms, 70000);
assert.equal(data.p95_ms, 70000); assert.equal(data.fps, 2000/80000);
now=90000; data=sandbox.window.__bridgeFrameTiming(); assert.equal(data.stalled_ms,10000);
for(let i=0;i<305;i++) frame(now += 16);
assert.equal(sandbox.window.__bridgeFrameTiming().samples,300);
console.log('Browser frame timing handles long and ongoing stalls with bounded samples');
