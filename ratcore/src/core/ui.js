// RatCore Core [ui] — Декларативный HUD (виджеты, тосты, диалоги с выборами) без сырого DOM (Уровень 0 Core)

import { clamp } from './math.js';
import { RatCoreError } from './seal.js';

export const UI_WIDGET_KINDS = Object.freeze(['bar', 'counter', 'compass', 'panel', 'minimap', 'badge']);

export class UiHudManager {
  constructor() {
    this.widgets = new Map();
    this.toasts = [];
    this.dialogs = new Map();
    this.nextToastId = 1;
  }

  setWidget({ id, kind = 'counter', label = '', value = 0, max = 100, tone = 'info', visible = true } = {}) {
    const wid = String(id || '').trim();
    if (!wid) throw new RatCoreError('RC-104', 'Укажи id HUD-виджета', 'Например: { id: "hp", kind: "bar", value: 85, max: 100 }.');
    const w = {
      id: wid,
      kind: UI_WIDGET_KINDS.includes(kind) ? kind : 'counter',
      label: String(label || wid),
      value,
      max: Number(max),
      pct: typeof value === 'number' && Number(max) > 0 ? Math.round(clamp((value / Number(max)) * 100, 0, 100)) : null,
      tone: String(tone),
      visible: Boolean(visible),
    };
    this.widgets.set(wid, w);
    return { ...w };
  }

  removeWidget({ id } = {}) {
    const removed = this.widgets.delete(String(id));
    return { id: String(id), removed };
  }

  notify({ text = '', level = 'info', ttlSec = 4.0 } = {}) {
    const toast = {
      id: `toast-${this.nextToastId++}`,
      text: String(text),
      level: String(level),
      remainingSec: clamp(Number(ttlSec), 0.5, 30),
    };
    this.toasts.push(toast);
    if (this.toasts.length > 8) this.toasts.shift();
    return { ...toast };
  }

  openDialog({ id = 'dlg-1', speaker = 'Система', text = '', choices = [] } = {}) {
    const did = String(id);
    const dlg = {
      id: did,
      speaker: String(speaker),
      text: String(text),
      choices: (Array.isArray(choices) ? choices : []).map((c, idx) => ({
        index: idx,
        label: typeof c === 'string' ? c : String(c.label || `Вариант ${idx + 1}`),
        action: typeof c === 'object' && c ? (c.action || null) : null,
      })),
      open: true,
      chosenIndex: null,
    };
    this.dialogs.set(did, dlg);
    return { ...dlg };
  }

  chooseDialog({ id = 'dlg-1', choiceIndex = 0 } = {}) {
    const dlg = this.dialogs.get(String(id));
    if (!dlg || !dlg.open) {
      throw new RatCoreError('RC-104', `Открытый диалог "${id}" не найден`, 'Сначала открой диалог через ui.openDialog().');
    }
    const idx = Number(choiceIndex) | 0;
    if (idx < 0 || idx >= dlg.choices.length) {
      throw new RatCoreError('RC-104', `Индекс варианта ${idx} вне диапазона (0..${dlg.choices.length - 1})`, 'Выбери существующий вариант.');
    }
    dlg.open = false;
    dlg.chosenIndex = idx;
    return { id: dlg.id, open: false, chosen: dlg.choices[idx] };
  }

  tick({ dt = 0.016 } = {}) {
    const step = Math.max(0, Number(dt));
    for (let i = this.toasts.length - 1; i >= 0; i--) {
      this.toasts[i].remainingSec -= step;
      if (this.toasts[i].remainingSec <= 0) this.toasts.splice(i, 1);
    }
    return { activeToasts: this.toasts.length, widgets: this.widgets.size };
  }

  getSummary(extra = {}) {
    return {
      ...extra,
      widgetCount: this.widgets.size,
      widgets: [...this.widgets.values()],
      toasts: this.toasts.map((t) => ({ id: t.id, text: t.text, level: t.level, remainingSec: Number(t.remainingSec.toFixed(2)) })),
      openDialogs: [...this.dialogs.values()].filter((d) => d.open),
    };
  }
}
