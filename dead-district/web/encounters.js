(function (global) {
  'use strict';
  var DD = global.DD = global.DD || {};
  var locations = ['у закрытого магазина', 'возле больницы', 'на заброшенной стоянке', 'у пожарной части', 'рядом с аптекой', 'на перекрёстке', 'у склада', 'на окраине', 'возле школы', 'у придорожного кафе'];
  var signs = ['слышны шаги за дверью', 'замечены следы борьбы', 'кто-то зовёт на помощь', 'горит тусклый свет', 'слышен стук', 'обнаружена открытая сумка', 'видны свежие следы', 'слышно радио', 'рядом брошен рюкзак', 'на стене есть предупреждение'];
  var supplies = [{id:'canned_beans',name:'консервы'}, {id:'bottled_water',name:'вода'}, {id:'bandage',name:'бинт'}, {id:'canned_soup',name:'суп'}, {id:'chocolate_bar',name:'шоколад'}];
  // 10 × 10 × 5 × 21 × 2 = 21 000 параметрических ситуаций.
  function get(index) {
    if (!Number.isInteger(index) || index < 0 || index >= 21000) return null;
    var n=index, place=n%10; n=Math.floor(n/10); var sign=n%10; n=Math.floor(n/10);
    var supply=n%5; n=Math.floor(n/5); var risk=n%21; n=Math.floor(n/21); var urgency=n%2;
    return { index:index, code:'EVT-'+String(index+1).padStart(5,'0'),
      description:locations[place]+': '+sign[sign]+'. '+(urgency?'Времени мало.':'Можно осмотреться.'),
      supply:supplies[supply], risk:risk, urgency:urgency };
  }
  function resolve(event, choice, stamina) {
    if (!event || ['leave','quiet','force'].indexOf(choice)<0) return null;
    if(choice==='leave') return {ending:'Уйти', text:'Вы обходите место стороной и сохраняете силы.', hp:0, stamina:0, item:null, noise:0};
    var success = choice==='quiet' ? event.risk < 8 + Math.floor(Math.max(0,stamina)/20) - event.urgency*2 : event.risk < 15;
    if(success) return {ending:choice==='quiet'?'Тихая находка':'Быстрый обыск', text:'Вы находите: '+event.supply.name+'.', hp:0, stamina:choice==='quiet'?-5:-10, item:event.supply.id, noise:choice==='quiet'?20:65};
    return {ending:choice==='quiet'?'Замечены':'Столкновение', text:'Обыск сорвался: вы получили ранение и отступили без добычи.', hp:choice==='quiet'?-5:-12, stamina:choice==='quiet'?-5:-10, item:null, noise:choice==='quiet'?45:75};
  }
  DD.Encounters={count:21000,get:get,resolve:resolve};
})(window);
