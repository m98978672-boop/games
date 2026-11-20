// Мелкие помощники: DOM, числа, форматирование, очередь событий.
window.WC = window.WC || {};

WC.util = (function () {
  'use strict';

  var U = {};

  U.$ = function (sel, root) { return (root || document).querySelector(sel); };
  U.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  U.el = function (tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        var value = attrs[key];
        if (value == null) return;
        if (key === 'class') node.className = value;
        else if (key === 'text') node.textContent = value;
        else if (key === 'html') node.innerHTML = value;
        else if (key.slice(0, 2) === 'on' && typeof value === 'function') node.addEventListener(key.slice(2), value);
        else node.setAttribute(key, value);
      });
    }
    (children || []).forEach(function (child) {
      if (child == null) return;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return node;
  };

  U.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  U.clamp01 = function (v) { return U.clamp(v, 0, 1); };
  U.lerp = function (a, b, t) { return a + (b - a) * t; };
  U.pct = function (v) { return Math.round(U.clamp01(v) * 100) + '%'; };
  U.pctNum = function (v) { return Math.round(U.clamp01(v) * 100); };

  U.money = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };

  U.clockLabel = function (seconds, shiftSeconds, shiftHours) {
    var t = Math.max(0, Math.min(1, seconds / shiftSeconds));
    var total = t * shiftHours * 60;
    var h = Math.floor(total / 60);
    var m = Math.floor(total % 60);
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  };

  U.timeLeft = function (seconds) {
    var s = Math.max(0, Math.round(seconds));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  };

  U.deg = function (rad) { return (rad * 180) / Math.PI; };

  U.hexToRgb = function (hex) {
    var value = hex.replace('#', '');
    if (value.length === 3) value = value.split('').map(function (c) { return c + c; }).join('');
    var num = parseInt(value, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  };

  U.shade = function (hex, k) {
    var rgb = U.hexToRgb(hex).map(function (c) { return U.clamp(Math.round(c * k), 0, 255); });
    return '#' + rgb.map(function (c) { return c.toString(16).padStart(2, '0'); }).join('');
  };

  // Тост в общий HUD (тема даёт .toasts / .toast)
  U.toast = function (text, tone, durationMs) {
    var host = document.getElementById('toasts');
    if (!host) return null;
    var node = document.createElement('div');
    node.className = 'toast' + (tone ? ' ' + tone : '');
    node.textContent = text;
    host.appendChild(node);
    setTimeout(function () {
      node.classList.add('out');
      setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 420);
    }, durationMs || 3200);
    while (host.children.length > 4) host.removeChild(host.firstChild);
    return node;
  };

  U.now = function () { return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now(); };

  U.pick = function (arr, rnd) { return arr[Math.floor((rnd ? rnd() : Math.random()) * arr.length) % arr.length]; };

  U.capitalize = function (s) { return s ? s[0].toUpperCase() + s.slice(1) : s; };

  return U;
})();
