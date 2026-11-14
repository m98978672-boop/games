(function (global) {
  'use strict';
  var DD = global.DD = global.DD || {};
  var actions = ['покой', 'ходьба', 'бег', 'крадётся', 'удар'];
  var dirs = ['вниз', 'вверх', 'влево', 'вправо'];
  var styles = ['обычный', 'тяжёлый', 'лёгкий', 'осторожный', 'резкий'];
  // 5 действий × 4 направления × 5 стилей × 100 темпов × 100 амплитуд.
  function get(index) {
    if (!Number.isInteger(index) || index < 0 || index >= 1000000) return null;
    var variant = index % 10000;
    var tempo = variant % 100, amplitude = Math.floor(variant / 100);
    var style = Math.floor(index / 10000) % 5;
    var direction = Math.floor(index / 50000) % 4;
    var action = Math.floor(index / 200000);
    return { index: index, code: 'ANIM-' + String(index + 1).padStart(7, '0'), action: action, direction: direction, style: style, variant: variant,
      speed: 0.65 + tempo * 0.008, bob: [1, 1.5, 0.65, 0.45, 1.2][style] * (0.5 + amplitude / 100),
      label: actions[action] + ' · ' + dirs[direction] + ' · ' + styles[style] + ' · темп ' + (tempo + 1) + ' · амплитуда ' + (amplitude + 1) };
  }
  DD.Animations = { count: 1000000, get: get };
})(window);
