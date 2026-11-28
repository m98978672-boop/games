// Планы доков по часам симуляции: одна попытка в назначенное время.
(function (root, factory) {
  var api=factory();
  if (typeof module==='object' && module.exports) module.exports=api;
  if (root) { root.WC=root.WC||{}; root.WC.schedule=api; }
})(typeof window!=='undefined' ? window : globalThis, function () {
  'use strict';
  function create() { return {version:1, unload:null, load:null}; }
  function schedule(state,kind,delay,now,end) {
    if (kind!=='load' && kind!=='unload') return {ok:false,reason:'Неизвестный тип фуры'};
    if ([30,60,120].indexOf(delay)<0) return {ok:false,reason:'Выберите 30, 60 или 120 секунд'};
    if (state[kind]) return {ok:false,reason:'Для этого дока уже есть запланированный вызов'};
    if (now+delay>=end) return {ok:false,reason:'Вызов не успеет до конца смены'};
    state[kind]={due:now+delay}; return {ok:true};
  }
  function cancel(state,kind) {
    if ((kind!=='load' && kind!=='unload') || !state[kind]) return {ok:false,reason:'Нет запланированного вызова'};
    state[kind]=null; return {ok:true};
  }
  function takeDue(state,now) {
    var due=[];
    ['unload','load'].some(function (kind) { if (state[kind] && state[kind].due<=now) { due.push(kind); state[kind]=null; return true; } return false; });
    return due;
  }
  function validate(value) {
    if (!value || value.version!==1 || !['load','unload'].every(function (k) {
      return value[k]===null || (value[k] && Number.isFinite(value[k].due) && value[k].due>=0);
    })) throw new Error('Повреждено расписание фур');
    return JSON.parse(JSON.stringify(value));
  }
  return {create:create,schedule:schedule,cancel:cancel,takeDue:takeDue,validate:validate};
});
