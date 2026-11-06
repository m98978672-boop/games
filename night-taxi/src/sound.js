// Synthesized locally with Web Audio; audio starts only after explicit consent.
export function createSound(AudioContextClass){
 let context=null,master,engine,engineGain,wind,windGain,enabled=false;
 function enable(){
  if(!AudioContextClass)return false;
  try{
   if(!context){
    context=new AudioContextClass();master=context.createGain();master.gain.value=.20;master.connect(context.destination);
    engine=context.createOscillator();engine.type='sawtooth';engine.frequency.value=55;engineGain=context.createGain();engineGain.gain.value=0;engine.connect(engineGain);engineGain.connect(master);engine.start();
    wind=context.createOscillator();wind.type='triangle';wind.frequency.value=110;windGain=context.createGain();windGain.gain.value=0;wind.connect(windGain);windGain.connect(master);wind.start();
   }
   enabled=true;if(context.state==='suspended')context.resume().catch(()=>{});return true;
  }catch{enabled=false;return false}
 }
 function setEnabled(value){if(value)return enable();enabled=false;if(context){engineGain.gain.setTargetAtTime(0,context.currentTime,.04);windGain.gain.setTargetAtTime(0,context.currentTime,.04)}return true}
 function update(speed,active,rain=false){if(!context||!enabled)return;const t=context.currentTime;engine.frequency.setTargetAtTime(47+Math.min(speed,22)*6,t,.12);engineGain.gain.setTargetAtTime(active?.045+Math.min(speed,20)*.0015:0,t,.08);wind.frequency.setTargetAtTime(100+speed*4,t,.2);windGain.gain.setTargetAtTime(active?(rain?.025:Math.min(speed*.001,.018)):0,t,.1)}
 const cues={horn:[180,.32,'square'],order:[660,.18,'sine'],accept:[520,.12,'sine'],arrive:[740,.16,'sine'],board:[350,.16,'triangle'],complete:[880,.3,'sine'],gear:[145,.09,'triangle'],collision:[75,.22,'sawtooth'],indicator:[820,.045,'square'],switch:[440,.06,'sine']};
 function cue(name){if(!enabled||!context||!cues[name])return;const [frequency,duration,type]=cues[name],t=context.currentTime,o=context.createOscillator(),g=context.createGain();o.type=type;o.frequency.setValueAtTime(frequency,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(name==='horn'?.16:.06,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(master);o.onended=()=>{o.disconnect();g.disconnect()};o.start(t);o.stop(t+duration+.02)}
 return {setEnabled,update,cue,get enabled(){return enabled},get supported(){return !!AudioContextClass}};
}
