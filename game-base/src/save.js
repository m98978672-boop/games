/* БАЗА — сохранение прогресса в localStorage (как у всех игр репозитория). */
(function () {
  GB.save = {
    load() {
      try {
        const raw = localStorage.getItem(GB.CONFIG.saveKey);
        return raw ? JSON.parse(raw) : {};
      } catch (e) {
        return {};
      }
    },
    write(data) {
      try {
        localStorage.setItem(GB.CONFIG.saveKey, JSON.stringify(data));
        return true;
      } catch (e) {
        return false;
      }
    },
    clear() {
      try { localStorage.removeItem(GB.CONFIG.saveKey); } catch (e) { /* нет доступа */ }
    },
  };
})();
