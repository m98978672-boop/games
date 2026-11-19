import assert from 'node:assert/strict';
import {createEngine} from '../ratcore/ratcore.js';
import {createAvatarEngine} from './avatar-engine.mjs';
const avatar=createAvatarEngine(createEngine({preset:'balanced'}));
const render=()=>{const f=avatar.capture(240,280);assert.ok(f.drawnTris>0);assert.ok(f.nonEmptyRatio>0.04);return Array.from(f.pixels);};
const front=render();avatar.setAngle(180);assert.notDeepEqual(render(),front);
avatar.setAngle(0);avatar.setOutfit('trousers');assert.notDeepEqual(render(),front);
avatar.setOutfit('skirt');assert.deepEqual(render(),front);
console.log('ИИнга: реальные кадры RatCore, поворот и смена одежды проверены');
