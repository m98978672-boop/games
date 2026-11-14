(function (global) {
  'use strict';
  var DD = global.DD = global.DD || {};
  // Техническая эвристика, не модель распознавания и не художественная оценка.
  function analyze(pixels, reference) {
    if (!pixels || !pixels.length || pixels.length % 4) throw new Error('Неверные данные изображения');
    if (reference && reference.length !== pixels.length) throw new Error('Изображения должны быть одинакового размера');
    var sum = 0, sum2 = 0, visible = 0, diff = 0;
    var count = pixels.length / 4;
    for (var i = 0; i < pixels.length; i += 4) {
      var alpha = pixels[i + 3] / 255;
      if (alpha > 0.05) {
        var lum = (0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2]) / 255;
        sum += lum; sum2 += lum * lum; visible++;
      }
      if (reference) {
        // Прозрачность учитывается на нейтральном фоне.
        var ra = reference[i + 3] / 255;
        for (var c = 0; c < 3; c++) diff += Math.abs((pixels[i + c] * alpha + 128 * (1 - alpha)) - (reference[i + c] * ra + 128 * (1 - ra)));
      }
    }
    var contrast = visible ? Math.sqrt(Math.max(0, sum2 / visible - Math.pow(sum / visible, 2))) : 0;
    var coverage = visible / count;
    var warnings = [];
    if (coverage < 0.05) warnings.push('Почти пустое изображение');
    if (visible && contrast < 0.07) warnings.push('Низкий контраст');
    return { coverage: coverage, contrast: contrast, difference: reference ? diff / (count * 3 * 255) : null, warnings: warnings };
  }
  DD.AssetAssistant = { analyze: analyze };
})(window);
