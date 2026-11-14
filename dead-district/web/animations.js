(function (global) {
  'use strict';
  var DD = global.DD = global.DD || {};
  var actions = ['покой', 'ходьба', 'бег', 'крадётся', 'удар'];
  var dirs = ['вниз', 'вверх', 'влево', 'вправо'];
  var styles = ['обычный', 'тяжёлый', 'лёгкий', 'осторожный', 'резкий'];
  // 5 действий × 4 направления × 5 стилей × 100 темпов = 10 000 параметрических вариантов.
  function get(index) {
    if (!Number.isInteger(index) || index < 0 || index >= 10000) return null;
    var variant = index % 100;
    var style = Math.floor(index / 100) % 5;
    var direction = Math.floor(index / 500) % 4;
    var action = Math.floor(index / 2000);
    return { index: index, code: 'ANIM-' + String(index + 1).padStart(5, '0'), action: action, direction: direction, style: style, variant: variant,
      speed: 0.65 + variant * 0.008, bob: [1, 1.5, 0.65, 0.45, 1.2][style],
      label: actions[action] + ' · ' + dirs[direction] + ' · ' + styles[style] + ' · темп ' + (variant + 1) };
  }
  DD.Animations = { count: 10000, get: get };
})(window);
