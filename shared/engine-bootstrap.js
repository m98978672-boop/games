/* ============================================================
   Games — автоподключение движка на любой странице (shared/engine-bootstrap.js)
   ------------------------------------------------------------
   Подключается сразу после shared/engine.js на КАЖДОЙ странице
   репозитория (витрина, новости, мессенджер, игры, шаблон).
   Делает одно и то же везде — без правок логики самой страницы:

   1. Заполняет все элементы [data-engine-version] версией ядра
      (в едином HUD-стиле: <span data-engine-version>).
   2. Монтирует плашку движка в [data-engine-badge], если она есть.
   3. Ставит класс .engine-ready на <body>, чтобы стили могли
      показать подпись без мигания.
   4. Публикует window.GamesEngineStatus для тестов и отладки.

       <script src="../shared/engine.js" defer></script>
       <script src="../shared/engine-bootstrap.js" defer></script>
   ============================================================ */
(function (global) {
  'use strict';

  if (typeof document === 'undefined') return;
  var doc = document;

  function ready(fn) {
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  function setVersionText(engine) {
    var full = 'RatCore v' + engine.version();
    var nodes = doc.querySelectorAll('[data-engine-version]');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var mode = node.getAttribute('data-engine-version');
      node.textContent = mode === 'short' ? 'v' + engine.version() : full;
      if (!node.getAttribute('title')) {
        node.setAttribute('title', full + ' — единый движок всех разделов Games');
      }
    }
    return nodes.length;
  }

  function mountBadge(engine) {
    var hosts = doc.querySelectorAll('[data-engine-badge]');
    for (var i = 0; i < hosts.length; i++) {
      var host = hosts[i];
      if (host.getAttribute('data-engine-badge-mounted') === 'true') continue;
      host.setAttribute('data-engine-badge-mounted', 'true');
      engine.badge({ mount: host, href: (host.getAttribute('data-engine-badge-href') || '../ratcore/README.md') });
    }
    return hosts.length;
  }

  ready(function () {
    var engine = global.GamesEngine;
    if (!engine) {
      // shared/engine.js не подключён — громко сообщаем в консоль, но не ломаем страницу.
      if (global.console && console.warn) {
        console.warn('[Games] shared/engine.js не найден: подключите движок перед engine-bootstrap.js');
      }
      return;
    }

    setVersionText(engine);
    mountBadge(engine);

    engine.ready().then(function (rc) {
      if (doc.body) doc.body.classList.add('engine-ready');
      var status = {
        version: rc.VERSION,
        modules: rc.MODULE_COUNT || 0,
        bundle: engine.BUNDLE_URL,
        loaded: true,
      };
      global.GamesEngineStatus = status;
      doc.dispatchEvent(new CustomEvent('games:engine-ready', { detail: status }));
    }).catch(function (err) {
      if (doc.body) doc.body.classList.add('engine-failed');
      global.GamesEngineStatus = { version: engine.version(), loaded: false, error: String(err && err.message || err) };
      if (global.console && console.warn) {
        console.warn('[Games] движок не загрузился:', err && err.message ? err.message : err);
      }
    });
  });
})(typeof window !== 'undefined' ? window : globalThis);
