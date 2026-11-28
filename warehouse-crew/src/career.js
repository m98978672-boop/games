// Карьера — отдельный бюджет и репутация, только фактические события симуляции.
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) { root.WC = root.WC || {}; root.WC.career = api; }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  var offers = [
    {id:'local', name:'Магазины города', description:'Уложить 3 заказа.', event:'delivered', goal:3, reward:35},
    {id:'fragile', name:'Осторожный заказчик', description:'Уложить 2 заказа вовремя и с повреждением ниже 5%.', event:'delivered', goal:2, reward:45, clean:true},
    {id:'freight', name:'Транспортная компания', description:'Загрузить 2 коробки в фуры.', event:'loaded', goal:2, reward:45},
    {id:'incoming', name:'Северный поставщик', description:'Уложить 2 коробки из разгрузочной фуры.', event:'delivered', goal:2, reward:45, source:'truck'},
    {id:'heavy', name:'Промышленный клиент', description:'Уложить 2 коробки весом от 20 кг.', event:'delivered', goal:2, reward:45, heavy:true},
  ];
  var upgrades = [
    {id:'logistics', name:'Организация приёмки', description:'Новые заказы приходят на 5% чаще за уровень; начиная со следующей смены.'},
    {id:'quality', name:'Обучение качеству', description:'+2 очка смены за уровень за каждую своевременную и неповреждённую укладку; со следующей смены.'},
    {id:'accounting', name:'Управление доходами', description:'+2 кредита карьеры за уровень за каждую укладку и загрузку; со следующей смены.'},
  ];
  var modes = [
    {id:'normal', name:'Обычная', factor:1, description:'Стандартный поток и выплаты.'},
    {id:'calm', name:'Спокойная', factor:1.25, description:'Приёмка на 25% реже, выручка на 20% ниже.'},
    {id:'rush', name:'Напряжённая', factor:.8, description:'Приёмка на 20% чаще, выручка на 20% выше.'},
  ];
  function levels() { return {logistics:0, quality:0, accounting:0}; }
  function current() { return {offer:null, progress:0, delivered:0, loaded:0, perfect:0, baseline:{dropped:0, ruined:0, missed:0}, settled:false, mode:'normal', applied:levels()}; }
  function create() { return {version:1, enabled:false, balance:0, reputation:50, shifts:0, totalDelivered:0, totalLoaded:0, won:false, nextMode:'normal', upgrades:levels(), current:current(), history:[]}; }
  function getOffer(id) { return offers.find(function (x) { return x.id === id; }); }
  function getMode(id) { return modes.find(function (x) { return x.id === id; }); }
  function safeStats(stats) { return {dropped:stats.dropped || 0, ruined:stats.ruined || 0, missed:stats.missed || 0}; }
  function begin(state, stats) {
    state.current = current();
    state.current.baseline = safeStats(stats);
    state.current.mode = state.nextMode;
    state.current.applied = Object.assign({}, state.upgrades);
  }
  function enable(state, stats) {
    if (state.enabled) return {ok:false, reason:'Карьера уже начата'};
    state.enabled = true; begin(state, stats);
    return {ok:true};
  }
  function setMode(state, id) {
    if (!state.enabled || !getMode(id)) return {ok:false, reason:'Режим недоступен'};
    state.nextMode=id; return {ok:true};
  }
  function chooseOffer(state, id) {
    if (!state.enabled || state.current.settled || state.current.offer) return {ok:false, reason:'Заказчик уже выбран или карьера не активна'};
    if (!getOffer(id)) return {ok:false, reason:'Неизвестный заказчик'};
    state.current.offer=id; return {ok:true};
  }
  function buy(state, id) {
    if (!state.enabled || !upgrades.some(function (u) { return u.id === id; })) return {ok:false, reason:'Улучшение недоступно'};
    var level = state.upgrades[id], cost = 60 * (level + 1);
    if (level >= 3) return {ok:false, reason:'Достигнут максимальный уровень'};
    if (state.balance < cost) return {ok:false, reason:'Недостаточно кредитов карьеры: нужно ' + cost};
    state.balance -= cost; state.upgrades[id]++; return {ok:true, cost:cost};
  }
  function spawnInterval(state, base) { return base * getMode(state.current.mode).factor * (1 - state.current.applied.logistics * .05); }
  function record(state, event, order, result) {
    if (!state.enabled || state.current.settled || !order || !result || (event !== 'delivered' && event !== 'loaded')) return {scoreBonus:0, completed:false};
    var c=state.current, clean=event === 'delivered' && result.late === false && Number.isFinite(order.damage) && order.damage < .05;
    if (event === 'delivered') { c.delivered++; if (clean) c.perfect++; }
    else c.loaded++;
    var offer=getOffer(c.offer), completed=false;
    if (offer && c.progress < offer.goal && offer.event === event && (!offer.clean || clean) && (!offer.source || order.source === offer.source) && (!offer.heavy || order.mass >= 20)) {
      c.progress++; completed=c.progress === offer.goal;
    }
    return {scoreBonus:clean ? c.applied.quality * 2 : 0, completed:completed};
  }
  function settle(state, stats) {
    if (!state.enabled || state.current.settled) return null;
    var c=state.current, offer=getOffer(c.offer), success=!!offer && c.progress >= offer.goal;
    var ruined=Math.max(0,stats.ruined-c.baseline.ruined), missed=Math.max(0,stats.missed-c.baseline.missed), dropped=Math.max(0,stats.dropped-c.baseline.dropped);
    var gross=(c.delivered*10+c.loaded*12+(c.delivered+c.loaded)*c.applied.accounting*2);
    var factor=c.mode === 'rush' ? 1.2 : c.mode === 'calm' ? .8 : 1;
    gross=Math.round(gross*factor); var bonus=success ? offer.reward : 0, penalties=ruined*8+missed*6+dropped*2;
    var change=gross+bonus-penalties;
    state.balance=Math.max(0,state.balance+change);
    var reputationChange=(success ? 5 : offer ? -3 : 0) + Math.min(3,c.perfect) - Math.min(10,ruined*2+missed);
    state.reputation=Math.max(0,Math.min(100,state.reputation+reputationChange));
    state.shifts++; state.totalDelivered+=c.delivered; state.totalLoaded+=c.loaded; c.settled=true;
    state.won = state.won || (state.shifts>=5 && state.totalDelivered>=20 && state.reputation>=60);
    var report={shift:state.shifts, mode:c.mode, offer:c.offer, success:success, delivered:c.delivered, loaded:c.loaded, perfect:c.perfect, gross:gross, bonus:bonus, penalties:penalties, balance:state.balance, reputation:state.reputation};
    state.history.unshift(report); if(state.history.length>20) state.history.pop();
    return report;
  }
  function validate(value) {
    function integer(n,max) { return Number.isSafeInteger(n) && n>=0 && n<=(max || 1000000000); }
    function validLevels(v) { return v && upgrades.every(function (u) { return integer(v[u.id],3); }); }
    var c=value && value.current, offer=c && getOffer(c.offer);
    if (!value || value.version!==1 || typeof value.enabled!=='boolean' || typeof value.won!=='boolean' || !integer(value.balance) || !integer(value.reputation,100) ||
        !integer(value.shifts) || !integer(value.totalDelivered) || !integer(value.totalLoaded) || !getMode(value.nextMode) || !validLevels(value.upgrades) ||
        !c || !getMode(c.mode) || !validLevels(c.applied) || typeof c.settled!=='boolean' || (c.offer!==null && !offer) || !integer(c.progress) ||
        (offer ? c.progress>offer.goal : c.progress!==0) || !integer(c.delivered) || !integer(c.loaded) || !integer(c.perfect) || c.perfect>c.delivered ||
        !c.baseline || !integer(c.baseline.dropped) || !integer(c.baseline.ruined) || !integer(c.baseline.missed) ||
        !Array.isArray(value.history) || value.history.length>20 || value.history.length>value.shifts) throw new Error('Повреждена карьера');
    value.history.forEach(function (h) {
      if (!h || !integer(h.shift) || h.shift<1 || h.shift>value.shifts || !getMode(h.mode) || (h.offer!==null && !getOffer(h.offer)) || typeof h.success!=='boolean' ||
          !['delivered','loaded','perfect','gross','bonus','penalties','balance'].every(function (key) { return integer(h[key]); }) || !integer(h.reputation,100)) throw new Error('Повреждена история карьеры');
    });
    return JSON.parse(JSON.stringify(value));
  }
  return {offers:offers, upgrades:upgrades, modes:modes, create:create, enable:enable, begin:begin, setMode:setMode, chooseOffer:chooseOffer, buy:buy, spawnInterval:spawnInterval, record:record, settle:settle, validate:validate};
});
