import assert from 'node:assert/strict';
import * as THREE from 'three';
import {addCityProps,PROP_DESIGNS,PROP_VARIANTS} from '../src/city-props.js';
import {createRain} from '../src/weather.js';
import {createVehicleEffects} from '../src/vehicle-effects.js';
import {createSound} from '../src/sound.js';
import {onRoad} from '../src/logic.js';
const scene=new THREE.Scene(),props=addCityProps(scene);
assert.equal(PROP_DESIGNS.length,20);assert.equal(PROP_VARIANTS,12);assert.equal(new Set(PROP_DESIGNS.map(x=>x[0])).size,20);assert.equal(props.reduce((n,p)=>n+p.count,0),240);
for(const p of props){assert.ok(p.geometry.attributes.position.count>0);assert.ok(p.instanceColor);for(let i=0;i<p.count;i++){const matrix=new THREE.Matrix4();p.getMatrixAt(i,matrix);const v=new THREE.Vector3().setFromMatrixPosition(matrix);assert.equal(onRoad(v.x,v.z),false,'props are off the road');}}
const rain=createRain(scene),attr=rain.mesh.geometry.attributes.position;assert.equal(rain.count,220);assert.equal(rain.mesh.visible,false);rain.update(0,10,20,true);let y=attr.array[1];rain.update(.1,11,21,true);assert.notEqual(attr.array[1],y);assert.equal(rain.mesh.position.x,11);assert.equal(rain.mesh.position.z,21);rain.update(0,11,21,false);assert.equal(rain.mesh.visible,false);
const effects=createVehicleEffects(new THREE.Group(),{length:4.8,width:1.8});effects.update(false,'left',0);assert.equal(effects.beam.visible,false);assert.ok(effects.lamps.filter(x=>x.side===1).every(x=>x.mesh.material.color.getHex()===0xffa729));effects.update(true,'left',.6);assert.equal(effects.beam.visible,true);assert.ok(effects.lamps.every(x=>x.mesh.material.color.getHex()===0x4e3210));effects.update(true,'off',.1,true,false);const angle=effects.wipers[0].pivot.rotation.z;effects.update(true,'off',.5,true,false);assert.notEqual(effects.wipers[0].pivot.rotation.z,angle,'wipers sweep during rain');effects.update(true,'off',.5,false,false);assert.equal(effects.wipers[0].pivot.rotation.z,effects.wipers[0].side,'wipers park when rain stops');
class Param{constructor(){this.value=0}setValueAtTime(v){this.value=v}setTargetAtTime(v){this.value=v}exponentialRampToValueAtTime(v){this.value=v}}
class Node{constructor(){this.frequency=new Param();this.gain=new Param()}connect(){}disconnect(){}start(){}stop(){}}
class Audio{constructor(){this.state='running';this.currentTime=0;this.destination={};Audio.created++}createGain(){return new Node()}createOscillator(){return new Node()}resume(){return Promise.resolve()}}Audio.created=0;
const noAudio=createSound(undefined);assert.equal(noAudio.setEnabled(true),false);const sound=createSound(Audio);assert.equal(Audio.created,0,'no autoplay');assert.equal(sound.setEnabled(true),true);assert.equal(Audio.created,1);sound.update(12,true,true);sound.cue('horn');sound.cue('arrive');sound.setEnabled(false);assert.equal(sound.enabled,false);assert.equal(sound.setEnabled(true),true);assert.equal(Audio.created,1,'reuse context');
console.log('240 вариантов городской мебели, дождь, фары, поворотники и локальный звук: OK');
