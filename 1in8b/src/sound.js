/* ============================================================
   1 ИЗ 8 МИЛЛИАРДОВ — музыка.
   ------------------------------------------------------------
   Ни одного звукового файла: всё считается на лету через
   WebAudio. Тихий гул двух расстроенных осцилляторов (как
   далёкий шум города), на каждый прожитый год — нота минорной
   пентатоники, на события — короткий отклик выше или ниже.
   Выключено по умолчанию; включается кнопкой в шапке, то есть
   всегда по жесту игрока — автозапуск звука браузеры не любят.
   ============================================================ */
(function () {
  'use strict';

  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null, master = null, padGain = null, started = false, on = false;
  var SCALE = [0, 3, 5, 7, 10];          /* минорная пентатоника */
  var BASE = 110;                        /* ля большой октавы */
  var step = 0;

  function ready() {
    if (!AC) return false;
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
    return true;
  }

  /* длинный фон: две волны чуть врозь + медленное дыхание */
  function startPad() {
    if (started) return;
    started = true;
    padGain = ctx.createGain();
    padGain.gain.value = 0.32;
    var filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 620;
    filt.Q.value = 0.6;
    padGain.connect(master);
    filt.connect(padGain);
    [[0, 0.5], [7, 1], [12, 1]].forEach(function (p, i) {
      var osc = ctx.createOscillator();
      osc.type = i === 2 ? 'sine' : 'triangle';
      osc.frequency.value = BASE * Math.pow(2, p[0] / 12) * p[1];
      var g = ctx.createGain();
      g.gain.value = i === 2 ? 0.08 : 0.16;
      /* дыхание: очень медленная волна громкости */
      var lfo = ctx.createOscillator();
      lfo.frequency.value = 0.035 + i * 0.017;
      var lg = ctx.createGain();
      lg.gain.value = i === 2 ? 0.05 : 0.09;
      lfo.connect(lg); lg.connect(g.gain); lfo.start();
      osc.connect(g); g.connect(filt); osc.start();
    });
  }

  /* короткая нота с мягкой атакой и длинным хвостом */
  function ping(semi, dur, vol, type) {
    if (!on || !ctx) return;
    var t = ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = BASE * 2 * Math.pow(2, semi / 12);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(master);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  /* каждый прожитый год — следующая ступень, раз в октаву выше */
  function year(age) {
    if (!on) return;
    step = (step + 1) % 10;
    var semi = SCALE[step % 5] + (step < 5 ? 0 : 12);
    ping(semi, 1.8, 0.16, 'sine');
    if (age % 10 === 0) ping(semi - 12, 2.6, 0.1, 'triangle');
  }

  /* событие года: хорошее выше, тяжёлое ниже */
  function event(kind) {
    if (!on) return;
    if (kind === 'bad') { ping(-2, 2.2, 0.13, 'triangle'); ping(-14, 2.6, 0.09, 'sine'); }
    else if (kind === 'good') { ping(12, 1.2, 0.13, 'sine'); ping(19, 1.0, 0.09, 'sine'); }
    else ping(7, 1.0, 0.1, 'sine');
  }

  /* прощание в конце жизни */
  function farewell() {
    if (!on) return;
    [0, 3, 7, 10].forEach(function (s, i) {
      setTimeout(function () { ping(s - 12, 3.4, 0.12, 'sine'); }, i * 650);
    });
  }

  function setOn(v) {
    if (v && !ready()) return false;
    on = !!v;
    if (on) {
      startPad();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.5, ctx.currentTime, 1.2);
    } else if (ctx) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.6);
    }
    return on;
  }

  window.IN8B = window.IN8B || {};
  window.IN8B.sound = {
    available: !!AC,
    isOn: function () { return on; },
    toggle: function () { return setOn(!on); },
    set: setOn,
    year: year,
    event: event,
    farewell: farewell
  };
})();
