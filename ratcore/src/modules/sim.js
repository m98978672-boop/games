// RatCore Module [sim] — Экономика, ресурсы, инвентарь с лимитом веса, крафт и демография (Уровень 1 Opt-In)

import { RatCoreError } from '../core/seal.js';

export class SimulationEconomy {
  constructor() {
    this.resources = new Map();
    this.recipes = new Map();
    this.population = 10;
    this.maxWeight = 100;
    this.itemWeights = new Map();
  }

  setResource({ id, amount = 0, unitWeight = 1 } = {}) {
    const key = String(id || '').trim();
    if (!key) throw new RatCoreError('RC-104', 'Укажи id ресурса', 'Например: { id: "wood", amount: 25 }.');
    const prev = this.resources.get(key) || 0;
    const next = Math.max(0, Number(amount));
    this.itemWeights.set(key, Math.max(0, Number(unitWeight)));
    const projectedWeight = this.getTotalWeight() - prev * (this.itemWeights.get(key) || 1) + next * (this.itemWeights.get(key) || 1);
    if (projectedWeight > this.maxWeight) {
      throw new RatCoreError('RC-603', `Превышен лимит веса инвентаря (${projectedWeight.toFixed(1)} > ${this.maxWeight})`, 'Увеличь maxWeight или скрафти более компактный предмет.');
    }
    this.resources.set(key, next);
    return { id: key, amount: next, totalWeight: Number(this.getTotalWeight().toFixed(2)), maxWeight: this.maxWeight };
  }

  defineRecipe({ id, inputs = {}, outputs = {} } = {}) {
    const key = String(id || '').trim();
    if (!key) throw new RatCoreError('RC-104', 'Укажи id рецепта крафта', 'Например: { id: "plank", inputs: { wood: 2 }, outputs: { plank: 4 } }.');
    this.recipes.set(key, { id: key, inputs: { ...inputs }, outputs: { ...outputs } });
    return { recipeId: key, defined: true };
  }

  craft({ recipeId, times = 1 } = {}) {
    const rec = this.recipes.get(recipeId);
    if (!rec) throw new RatCoreError('RC-104', `Рецепт "${recipeId}" не найден`, 'Зарегистрируй его через sim.defineRecipe().');
    const n = Math.max(1, Number(times) | 0);
    for (const [res, qty] of Object.entries(rec.inputs)) {
      const have = this.resources.get(res) || 0;
      if (have < qty * n) {
        throw new RatCoreError('RC-104', `Недостаточно ресурса "${res}" (нужно ${qty * n}, есть ${have})`, 'Добудь ресурсы перед крафтом.');
      }
    }
    for (const [res, qty] of Object.entries(rec.inputs)) {
      this.resources.set(res, (this.resources.get(res) || 0) - qty * n);
    }
    for (const [res, qty] of Object.entries(rec.outputs)) {
      this.resources.set(res, (this.resources.get(res) || 0) + qty * n);
    }
    return { crafted: recipeId, times: n, inventory: Object.fromEntries(this.resources) };
  }

  tickEconomy({ foodPerCapita = 0.5, growthRate = 0.05 } = {}) {
    const food = this.resources.get('food') || 0;
    const needed = this.population * Number(foodPerCapita);
    if (food >= needed) {
      this.resources.set('food', Number((food - needed).toFixed(2)));
      this.population = Math.round(this.population * (1 + Number(growthRate)));
      return { status: 'growing', population: this.population, foodRemaining: this.resources.get('food') };
    }
    this.resources.set('food', 0);
    this.population = Math.max(1, Math.floor(this.population * 0.92));
    return { status: 'shortage', population: this.population, foodRemaining: 0 };
  }

  getTotalWeight() {
    let w = 0;
    for (const [id, qty] of this.resources) {
      w += qty * (this.itemWeights.get(id) ?? 1);
    }
    return w;
  }

  getState() {
    return {
      population: this.population,
      totalWeight: Number(this.getTotalWeight().toFixed(2)),
      maxWeight: this.maxWeight,
      inventory: Object.fromEntries(this.resources),
      recipes: [...this.recipes.keys()],
    };
  }
}
