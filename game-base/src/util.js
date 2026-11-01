/* БАЗА — маленькие хелперы (общие для игры и шаблона). */
(function () {
  const U = {
    clamp(v, a, b) { return v < a ? a : v > b ? b : v; },
    lerp(a, b, t) { return a + (b - a) * t; },
    rand(a, b) { return a + Math.random() * (b - a); },
    randInt(a, b) { return Math.floor(U.rand(a, b + 1)); },
    pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    el(id) { return document.getElementById(id); },
    // число с узкими пробелами: 12 345
    fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); },
    on(elm, ev, fn) { elm.addEventListener(ev, fn); },
  };
  GB.util = U;
})();
