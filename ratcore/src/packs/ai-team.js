// RatCore Pack [pack:ai-team] — ИИ-команда: think, guess (Байес F-126), comm (каналы/CRDT), bugs (ddmin A-86), bridge (BridgeGuard)
// Подключается строго по выбору (Zero-Cost Opt-In, RC-108 когда пакет выключен).

import { clamp } from '../core/math.js';
import { encodeWire2Frame, decodeWire2Frame } from '../compress/wire2.js';

export class AiTeamSuite {
  constructor() {
    this.thoughts = new Map();
    this.hypotheses = new Map();
    this.channels = new Map([['general', []]]);
    this.inboxes = new Map();
    this.tasks = new Map(); // CRDT-реестр задач (LWW по version)
    this.reports = [];
    this.seq = 1;
  }

  // -------------------- 1. tools.think.* --------------------
  thinkStart({ topic, goal, agentId = 'ai-1' } = {}) {
    const id = `th_${this.seq++}`;
    const node = {
      id,
      topic: String(topic || 'untitled'),
      goal: String(goal || ''),
      agentId,
      branches: [],
      conclusion: null,
      createdAt: Date.now(),
    };
    this.thoughts.set(id, node);
    return { id, topic: node.topic, goal: node.goal };
  }

  thinkBranch({ thoughtId, label, rationale, score = 0.5 } = {}) {
    const th = this.thoughts.get(thoughtId);
    if (!th) return null;
    const br = {
      id: `br_${th.branches.length + 1}`,
      label: String(label || 'option'),
      rationale: String(rationale || ''),
      score: clamp(Number(score), 0, 1),
    };
    th.branches.push(br);
    return br;
  }

  thinkConclude({ thoughtId, decision, summary = '' } = {}) {
    const th = this.thoughts.get(thoughtId);
    if (!th) return null;
    const ranked = [...th.branches].sort((a, b) => b.score - a.score);
    th.conclusion = {
      decision: decision || (ranked[0] ? ranked[0].label : 'none'),
      summary: String(summary),
      bestBranch: ranked[0] || null,
      branchesCount: ranked.length,
    };
    return th.conclusion;
  }

  // -------------------- 2. tools.guess.* (Формула Байеса F-126) --------------------
  guessPropose({ id, statement, prior = 0.5 } = {}) {
    const hid = String(id || `hyp_${this.seq++}`);
    const h = {
      id: hid,
      statement: String(statement || ''),
      probability: clamp(Number(prior), 0.001, 0.999),
      evidence: [],
    };
    this.hypotheses.set(hid, h);
    return { ...h };
  }

  // F-126: P(H|E) = P(E|H)*P(H) / (P(E|H)*P(H) + P(E|¬H)*(1 - P(H)))
  guessEvidence({ id, note = '', likelihoodIfTrue = 0.8, likelihoodIfFalse = 0.2 } = {}) {
    const h = this.hypotheses.get(id);
    if (!h) return null;
    const pH = h.probability;
    const pE_H = clamp(Number(likelihoodIfTrue), 0.001, 0.999);
    const pE_notH = clamp(Number(likelihoodIfFalse), 0.001, 0.999);
    const num = pE_H * pH;
    const den = num + pE_notH * (1 - pH);
    const posterior = clamp(num / Math.max(1e-9, den), 0.001, 0.999);
    h.probability = Number(posterior.toFixed(4));
    h.evidence.push({ note: String(note), pE_H, pE_notH, posterior: h.probability });
    return { id: h.id, probability: h.probability, evidenceCount: h.evidence.length };
  }

  guessRank() {
    return [...this.hypotheses.values()]
      .sort((a, b) => b.probability - a.probability)
      .map((h) => ({ id: h.id, statement: h.statement, probability: h.probability, evidenceCount: h.evidence.length }));
  }

  // -------------------- 3. tools.comm.* (Папки связи + CRDT задачи) --------------------
  commPost({ channel = 'general', from = 'ai-1', to = null, kind = 'note', text = '', data = null } = {}) {
    const ch = String(channel || 'general');
    const msg = {
      id: `msg_${this.seq++}`,
      channel: ch,
      from: String(from),
      to: to ? String(to) : null,
      kind: String(kind),
      text: String(text),
      data,
      ts: Date.now(),
    };
    if (!this.channels.has(ch)) this.channels.set(ch, []);
    this.channels.get(ch).push(msg);
    if (msg.to) {
      if (!this.inboxes.has(msg.to)) this.inboxes.set(msg.to, []);
      this.inboxes.get(msg.to).push(msg);
    }
    return msg;
  }

  commRead({ channel = 'general', inboxOf = null, limit = 20 } = {}) {
    const src = inboxOf ? (this.inboxes.get(String(inboxOf)) || []) : (this.channels.get(String(channel)) || []);
    return src.slice(-Math.max(1, Number(limit || 20)));
  }

  // CRDT LWW-слияние задач между несколькими ИИ-агентами
  commUpsertTask({ id, title, status = 'open', owner = null, version = 1 } = {}) {
    const tid = String(id || `task_${this.seq++}`);
    const existing = this.tasks.get(tid);
    const ver = Number(version || 1);
    if (existing && existing.version > ver) {
      return { merged: false, keptVersion: existing.version, task: existing };
    }
    const task = {
      id: tid,
      title: String(title ?? existing?.title ?? 'Untitled task'),
      status: String(status),
      owner: owner !== undefined ? owner : (existing?.owner ?? null),
      version: existing && existing.version === ver ? ver + 1 : ver,
      updatedAt: Date.now(),
    };
    this.tasks.set(tid, task);
    return { merged: true, task };
  }

  // -------------------- 4. tools.bugs.* (A-86: Delta Debugging ddmin) --------------------
  bugsReport({ title, severity = 'medium', code = 'RC-999', steps = [], expected = '', actual = '', author = 'ai-qa' } = {}) {
    const rep = {
      id: `BUG-${String(this.reports.length + 1).padStart(4, '0')}`,
      title: String(title || 'Untitled issue'),
      severity: String(severity),
      code: String(code),
      steps: Array.isArray(steps) ? [...steps] : [],
      expected: String(expected),
      actual: String(actual),
      author: String(author),
      status: 'open',
      createdAt: Date.now(),
    };
    this.reports.push(rep);
    return rep;
  }

  // A-86: Минимизация падающей последовательности действий (Delta Debugging ddmin)
  bugsMinimize({ steps = [], testFails } = {}) {
    if (!Array.isArray(steps) || typeof testFails !== 'function') {
      return { minimized: [], originalLength: 0, reductionPct: 0 };
    }
    let current = [...steps];
    let n = 2;
    let probes = 0;

    while (current.length >= 2 && probes < 256) {
      const chunkSize = Math.ceil(current.length / n);
      let reduced = false;

      for (let i = 0; i < current.length; i += chunkSize) {
        const subset = current.slice(i, i + chunkSize);
        probes++;
        if (subset.length > 0 && subset.length < current.length && testFails(subset)) {
          current = subset;
          n = 2;
          reduced = true;
          break;
        }
        const complement = [...current.slice(0, i), ...current.slice(i + chunkSize)];
        probes++;
        if (complement.length > 0 && complement.length < current.length && testFails(complement)) {
          current = complement;
          n = Math.max(n - 1, 2);
          reduced = true;
          break;
        }
      }

      if (!reduced) {
        if (n >= current.length) break;
        n = Math.min(current.length, n * 2);
      }
    }

    const orig = steps.length;
    return {
      minimized: current,
      originalLength: orig,
      minimizedLength: current.length,
      probes,
      reductionPct: orig > 0 ? Number(((1 - current.length / orig) * 100).toFixed(1)) : 0,
    };
  }

  // -------------------- 5. tools.bridge.* (BridgeGuard: экспорт в Three.js / Godot / Canvas 2D / RCW2) --------------------
  bridgeExportScene({ format = 'three-json', worldSnapshot, vault, entities = [] } = {}) {
    if (format === 'three-json') {
      const children = entities.map((e) => {
        const entry = vault.readSealedMesh(e.mesh, 'bridge.exportScene');
        return {
          name: e.id,
          type: 'Mesh',
          position: [e.x, e.h, -e.y],
          rotationYRad: ((e.yaw || 0) * Math.PI) / 180,
          scale: [e.scale || 1, e.scale || 1, e.scale || 1],
          ratcoreMeshId: e.mesh.id,
          triCount: entry.triCount,
        };
      });
      return { format: 'three-json', schema: 'ratcore-bridge-three/1', objectCount: children.length, scene: { type: 'Scene', children } };
    }

    if (format === 'godot-tscn') {
      const lines = ['[gd_scene format=3]', '', '[node name="RatCoreWorld" type="Node3D"]'];
      for (const e of entities) {
        vault.readSealedMesh(e.mesh, 'bridge.exportScene');
        lines.push('');
        lines.push(`[node name="${e.id}" type="MeshInstance3D" parent="."]`);
        lines.push(`transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, ${e.x}, ${e.h}, ${-e.y})`);
        lines.push(`metadata/ratcore_mesh_id = "${e.mesh.id}"`);
      }
      return { format: 'godot-tscn', objectCount: entities.length, text: lines.join('\n') };
    }

    if (format === 'rcw2') {
      const encoded = encodeWire2Frame(worldSnapshot || { entities: entities.length }, { codec: 'auto' });
      return {
        format: 'rcw2',
        rawBytes: encoded.rawBytes,
        wireBytes: encoded.wireBytes,
        savedPct: encoded.savedPct,
        crc32: encoded.crc32,
        frame: encoded.frame,
      };
    }

    return {
      format: 'canvas-2d',
      objectCount: entities.length,
      drawList: entities.map((e) => ({ id: e.id, x: e.x, y: e.y, r: e.radius || 1, tag: e.tag })),
    };
  }

  bridgeVerifyWire2(frameBytes) {
    return decodeWire2Frame(frameBytes, { asJson: true });
  }
}
