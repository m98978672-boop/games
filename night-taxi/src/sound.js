// Locally hosted CC0 engine recordings; playback starts only after a user gesture.
// Other short UI cues remain synthesized. See assets/audio/README.md for sources.
export function createSound(AudioContextClass,fetchAsset=globalThis.fetch?.bind(globalThis)){
 let context=null,master,lowSource,highSource,lowGain,highGain,wind,windGain,enabled=false;
 async function enable(){
  if(!AudioContextClass||!fetchAsset)return false;
  try{
   if(!context){
    context=new AudioContextClass();master=context.createGain();master.gain.value=.34;master.connect(context.destination);
    wind=context.createOscillator();wind.type='triangle';wind.frequency.value=110;windGain=context.createGain();windGain.gain.value=0;wind.connect(windGain);windGain.connect(master);wind.start();
   }
   // Resume immediately within the click gesture, before awaiting network/decode.
   if(context.state==='suspended')await context.resume();
   if(!lowSource){
    const files=['assets/audio/engine-lo.wav','assets/audio/engine-hi.wav'];
    const buffers=await Promise.all(files.map(async path=>{
     const response=await fetchAsset(path);if(!response.ok)throw new Error('Engine audio unavailable: '+path);
     return context.decodeAudioData(await response.arrayBuffer());
    }));
    [lowSource,highSource]=buffers.map(buffer=>{const source=context.createBufferSource();source.buffer=buffer;source.loop=true;return source});
    lowGain=context.createGain();highGain=context.createGain();lowGain.gain.value=highGain.gain.value=0;
    lowSource.connect(lowGain);highSource.connect(highGain);lowGain.connect(master);highGain.connect(master);
    lowSource.start();highSource.start();
   }
   enabled=true;return true;
  }catch(error){console.warn('Запись двигателя недоступна:',error);enabled=false;return false}
 }
 async function setEnabled(value){
  if(value)return enable();enabled=false;
  if(context&&lowGain){const t=context.currentTime;lowGain.gain.setTargetAtTime(0,t,.04);highGain.gain.setTargetAtTime(0,t,.04);windGain.gain.setTargetAtTime(0,t,.04)}
  return true;
 }
 function update(speed,active,rain=false,throttle=false,gear=1){
  if(!context||!enabled||!lowSource)return;
  const t=context.currentTime,rpm=Math.min(1,Math.max(0,speed/20*.82+(throttle?.15:0))),blend=Math.min(1,Math.max(0,(rpm-.22)/.65));
  // Equal-power blend and modest pitch changes preserve the recorded character.
  lowSource.playbackRate.setTargetAtTime(.85+rpm*.32,t,.18);highSource.playbackRate.setTargetAtTime(.85+rpm*.45,t,.18);
  lowGain.gain.setTargetAtTime(active?.5*Math.cos(blend*Math.PI/2):0,t,.12);
  highGain.gain.setTargetAtTime(active?.38*Math.sin(blend*Math.PI/2):0,t,.12);
  wind.frequency.setTargetAtTime(100+speed*4,t,.2);windGain.gain.setTargetAtTime(active?(rain?.02:Math.min(speed*.0007,.014)):0,t,.1);
 }
 const cues={horn:[180,.32,'square'],order:[660,.18,'sine'],accept:[520,.12,'sine'],arrive:[740,.16,'sine'],board:[350,.16,'triangle'],complete:[880,.3,'sine'],gear:[145,.09,'triangle'],collision:[75,.22,'sawtooth'],indicator:[820,.045,'square'],switch:[440,.06,'sine']};
 function cue(name){if(!enabled||!context||!cues[name])return;const [frequency,duration,type]=cues[name],t=context.currentTime,o=context.createOscillator(),g=context.createGain();o.type=type;o.frequency.setValueAtTime(frequency,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(name==='horn'?.16:.06,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(master);o.onended=()=>{o.disconnect();g.disconnect()};o.start(t);o.stop(t+duration+.02)}
 return {setEnabled,update,cue,get enabled(){return enabled},get supported(){return !!AudioContextClass&&!!fetchAsset}};
}
