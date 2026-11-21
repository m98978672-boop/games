// Озвучка по желанию игрока: только локальные русские голоса устройства.
window.WC = window.WC || {};
WC.voice = (function () {
  'use strict';
  var enabled = false;
  function synth() {
    return typeof window !== 'undefined' && window.speechSynthesis && window.SpeechSynthesisUtterance ? window.speechSynthesis : null;
  }
  function voices() {
    var s = synth();
    if (!s || typeof s.getVoices !== 'function') return [];
    try { return s.getVoices().filter(function (v) { return v.localService === true && /^ru(?:-|$)/i.test(v.lang || ''); }); }
    catch (err) { return []; }
  }
  function cancel() {
    var s = synth();
    if (s && typeof s.cancel === 'function') { try { s.cancel(); } catch (err) {} }
  }
  function setEnabled(value) {
    if (value && !voices().length) return false;
    enabled = Boolean(value);
    if (!enabled) cancel();
    return true;
  }
  function speak(line) {
    var s = synth(), available = voices();
    if (!enabled || !s || !available.length || s.speaking || s.pending ||
        (WC.audio && WC.audio.isMuted && WC.audio.isMuted()) ||
        (WC.game && WC.game.state && (WC.game.state.paused || WC.game.state.shiftEnded))) return false;
    try {
      var index = 0;
      for (var i=0; i<line.workerId.length; i++) index = (index * 31 + line.workerId.charCodeAt(i)) >>> 0;
      var utterance = new window.SpeechSynthesisUtterance(line.text);
      utterance.lang = 'ru-RU'; utterance.voice = available[index % available.length];
      utterance.rate = 1; utterance.volume = 0.85;
      s.speak(utterance);
      return true;
    } catch (err) { return false; }
  }
  return { available:function () { return voices().length > 0; }, setEnabled:setEnabled,
    isEnabled:function () { return enabled; }, speak:speak, cancel:cancel };
})();
