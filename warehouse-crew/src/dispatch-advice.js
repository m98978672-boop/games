// Прозрачная аналитика: только текущее состояние склада, без приказов симуляции.
(function (root, factory) {
  var api=factory();
  if (typeof module==='object' && module.exports) module.exports=api;
  if (root) { root.WC=root.WC||{}; root.WC.dispatchAdvice=api; }
})(typeof window!=='undefined' ? window : globalThis, function () {
  'use strict';
  function analyse(state, crew, truckWindow, paused, ended) {
    var free=state.slots.filter(function (s) { return !s.occupied; }).length;
    var stock=state.orders.filter(function (o) { return o.status==='stored'; }).length;
    var active=state.orders.filter(function (o) { return ['pending','claimed','carried'].indexOf(o.status)>=0; });
    var urgent=active.filter(function (o) { return o.direction!=='return' && Number.isFinite(o.deadline) && o.deadline-state.time<=30; }).length;
    var returns=active.filter(function (o) { return o.direction==='return'; }).length;
    var trucks=state.trucks.filter(function (t) { return t.status==='working' && Number.isFinite(t.arrivedAt) && truckWindow-(state.time-t.arrivedAt)<=30; }).length;
    var tired=crew.filter(function (w) { return !w.state.dead && (w.body.fatigue>=.8 || w.body.energy<=.2); }).length;
    var cards=[];
    if (ended) cards.push({id:'ended',tone:'info',text:'Смена завершена. Итоги доступны в отчёте.',target:'report'});
    else {
      if (paused) cards.push({id:'paused',tone:'info',text:'Пауза: заказы, фуры и сроки не продвигаются.',target:null});
      if (urgent) cards.push({id:'urgent',tone:'warn',text:'Заказов со сроком не более 30 секунд: ' + urgent + '. Проверьте очередь и назначение.',target:'queue'});
      if (trucks) cards.push({id:'trucks',tone:'warn',text:'Фур с окном до 30 секунд: ' + trucks + '. Проверьте ведомость и оставшийся груз.',target:'dock'});
      if (free<=2) cards.push({id:'space',tone:'warn',text:'Свободных ячеек: ' + free + '. ' + (stock ? 'Для освобождения места можно подготовить отгрузку.' : 'Проверьте занятые ячейки и грузы в работе.'),target:'dock'});
      if (tired) cards.push({id:'tired',tone:'warn',text:'Работников с сильной усталостью или низкой энергией: ' + tired + '. Проверьте состояние бригады.',target:'crew'});
      if (returns) cards.push({id:'returns',tone:'info',text:'Грузов на физическом возврате: ' + returns + '. Они ещё занимают работу бригады.',target:'queue'});
      if (!cards.length) cards.push({id:'normal',tone:'good',text:'Срочных предупреждений нет. Следите за очередью, запасами и состоянием работников.',target:'queue'});
    }
    return {free:free,stock:stock,active:active.length,urgent:urgent,trucks:trucks,tired:tired,returns:returns,cards:cards};
  }
  return {analyse:analyse};
});
