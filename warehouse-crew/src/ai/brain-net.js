// Нейросеть-мозг рабочего склада: прямой проход по обученным весам.
// Формат весов: warehouse-brain/1 (см. data/brain_weights.json).
// Файл намеренно классический (IIFE + module.exports) — его одинаково
// грузят браузер игры и Node-скрипт обучения, поэтому арифметика одна и та же.
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.WarehouseBrain = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var FEATURES = [
    { id: 'bias', label: 'Смещение', hint: 'постоянный сигнал 1' },
    { id: 'energy', label: 'Энергия', hint: 'глюкоза и гликоген мышц' },
    { id: 'stress', label: 'Стресс', hint: 'кортизол / адреналин' },
    { id: 'fatigue', label: 'Усталость', hint: 'накопление лактата в мышцах' },
    { id: 'pain', label: 'Боль', hint: 'ноцицепторы, травмы' },
    { id: 'load', label: 'Груз', hint: 'масса коробки относительно силы' },
    { id: 'capacity', label: 'Загрузка', hint: 'сколько несёт от предела' },
    { id: 'distance', label: 'Дальность', hint: 'расстояние до цели, 0..1' },
    { id: 'urgency', label: 'Срочность', hint: 'дедлайн заказа' },
    { id: 'queue', label: 'Очередь', hint: 'давление невыполненных заказов' },
    { id: 'neuroticism', label: 'Нейротизм', hint: 'черта: чувствительность к стрессу' },
    { id: 'paceTrait', label: 'Темп', hint: 'черта: склонность спешить' },
    { id: 'precisionTrait', label: 'Точность', hint: 'черта: аккуратность' },
    { id: 'enduranceTrait', label: 'Выносливость', hint: 'черта: устойчивость к усталости' },
    { id: 'cautionTrait', label: 'Осторожность', hint: 'черта: страх травмы' },
    { id: 'shift', label: 'Смена', hint: 'прогресс смены 0..1' },
    { id: 'teamBusy', label: 'Занятость бригады', hint: 'доля напарников в работе' },
    { id: 'waiting', label: 'Коробки в ожидании', hint: 'сколько заказов ждёт на полу' },
  ];

  var OUTPUTS = [
    { id: 'pace', label: 'Темп', hint: 'скорость перемещения и переноски' },
    { id: 'caution', label: 'Осторожность', hint: 'снижение риска уронить коробку' },
    { id: 'rest', label: 'Отдых', hint: 'готовность уйти на перерыв' },
    { id: 'precision', label: 'Точность', hint: 'сила хвата, аккуратная укладка' },
    { id: 'urgency', label: 'Напор', hint: 'брать ли срочный заказ первым' },
    { id: 'coop', label: 'Взаимодействие', hint: 'подменить уставшего напарника' },
  ];

  function sigmoid(x) {
    if (x >= 0) {
      var z = Math.exp(-x);
      return 1 / (1 + z);
    }
    var e = Math.exp(x);
    return e / (1 + e);
  }

  function tanh(x) {
    if (x > 8) return 1;
    if (x < -8) return -1;
    var e = Math.exp(2 * x);
    return (e - 1) / (e + 1);
  }

  function zeros(n) {
    var out = new Array(n);
    for (var i = 0; i < n; i++) out[i] = 0;
    return out;
  }

  function clamp01(v) {
    if (!isFinite(v)) return 0;
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  // Прямой проход. Веса — плоские массивы: w[o * inSize + i].
  function forward(model, inputs) {
    if (!model || !Array.isArray(model.layers) || !model.layers.length) {
      throw new Error('WarehouseBrain: нет слоёв весов');
    }
    var activations = inputs.slice();
    for (var l = 0; l < model.layers.length; l++) {
      var layer = model.layers[l];
      var outSize = layer.b.length;
      var inSize = activations.length;
      if (!Array.isArray(layer.w) || layer.w.length !== outSize * inSize) {
        throw new Error('WarehouseBrain: размер слоя ' + l + ' не совпадает с входом (' + inSize + ')');
      }
      var next = zeros(outSize);
      for (var o = 0; o < outSize; o++) {
        var sum = layer.b[o];
        var base = o * inSize;
        for (var i = 0; i < inSize; i++) sum += layer.w[base + i] * activations[i];
        next[o] = layer.activation === 'sigmoid' ? sigmoid(sum) : tanh(sum);
      }
      activations = next;
    }
    return activations;
  }

  function decision(model, inputs) {
    var raw = forward(model, inputs);
    var out = {};
    for (var i = 0; i < OUTPUTS.length; i++) out[OUTPUTS[i].id] = clamp01(raw[i]);
    return out;
  }

  function countParams(model) {
    var n = 0;
    for (var l = 0; l < model.layers.length; l++) {
      n += model.layers[l].w.length + model.layers[l].b.length;
    }
    return n;
  }

  return {
    FEATURES: FEATURES,
    OUTPUTS: OUTPUTS,
    forward: forward,
    decision: decision,
    countParams: countParams,
    sigmoid: sigmoid,
    tanh: tanh,
    clamp01: clamp01,
  };
});
