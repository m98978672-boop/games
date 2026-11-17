// Барьер 5 TransferGuard: статический аудитор кода RatMes (RM-107).
// Гарантирует, что UI и модули движка не отправляют байты напрямую по сети (fetch / WebSocket / http.request)
// и не пишут напрямую в RatMes-Vault/ в обход официальных транспортного и дискового драйверов.

import fs from 'node:fs';
import path from 'node:path';

const ALLOWED_TRANSPORT_DRIVERS = new Set([
  'src/web/bridge-client.mjs',
  'src/agent/server.mjs',
  'src/agent/live-bridges.mjs',
  'src/agent/lan-mesh.mjs',
  'sw.js',
]);

const ALLOWED_FS_DRIVERS = new Set([
  'src/engine/vault-store.mjs',
  'src/agent/server.mjs',
  'src/core/code-auditor.mjs',
]);

const TRANSPORT_PATTERNS = [
  { code: 'RM-104', name: 'RAW_FETCH', regex: /\bfetch\s*\(/g, msg: 'Прямой вызов fetch() запрещён вне bridge-client.mjs — используй инструменты передачи.' },
  { code: 'RM-104', name: 'RAW_WEBSOCKET', regex: /\bnew\s+WebSocket\s*\(/g, msg: 'Прямое создание WebSocket запрещено вне bridge-client.mjs — используй tools.relay.*.' },
  { code: 'RM-104', name: 'RAW_XHR', regex: /\bnew\s+XMLHttpRequest\s*\(/g, msg: 'Прямой XMLHttpRequest запрещён — используй инструменты передачи.' },
];

const FS_PATTERNS = [
  { code: 'RM-101', name: 'RAW_FS_WRITE', regex: /\b(?:writeFileSync|appendFileSync|promises\.writeFile|promises\.appendFile)\s*\(/g, msg: 'Прямая запись в файлы запрещена вне vault-store.mjs — используй tools.vault.*.' },
];

const DETERMINISM_PATTERNS = [
  { code: 'RM-107', name: 'RAW_MATH_RANDOM_IN_ENGINE', regex: /\bMath\.random\s*\(/g, msg: 'Внутри движка используй детерминированный PRNG RatCore (core.rand()), а не Math.random().' },
];

function walkFiles(dir, baseDir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'RatMes-Vault' || entry.name === 'tests') {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, baseDir, out);
    } else if (/\.(mjs|js)$/.test(entry.name)) {
      out.push({ full, rel: path.relative(baseDir, full).replace(/\\/g, '/') });
    }
  }
  return out;
}

export function auditSource(relPath, content) {
  const rel = String(relPath).replace(/\\/g, '/');
  if (rel === 'src/core/code-auditor.mjs') return [];
  const violations = [];
  const lines = String(content).split('\n');

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;

    if (!ALLOWED_TRANSPORT_DRIVERS.has(rel)) {
      for (const p of TRANSPORT_PATTERNS) {
        p.regex.lastIndex = 0;
        if (p.regex.test(line)) {
          violations.push({ file: rel, line: idx + 1, code: 'RM-107', rule: p.name, reason: p.msg, message: p.msg });
        }
      }
    }

    if (!ALLOWED_FS_DRIVERS.has(rel)) {
      for (const p of FS_PATTERNS) {
        p.regex.lastIndex = 0;
        if (p.regex.test(line)) {
          violations.push({ file: rel, line: idx + 1, code: 'RM-107', rule: p.name, reason: p.msg, message: p.msg });
        }
      }
    }

    if (rel.startsWith('src/')) {
      for (const p of DETERMINISM_PATTERNS) {
        p.regex.lastIndex = 0;
        if (p.regex.test(line)) {
          violations.push({ file: rel, line: idx + 1, code: 'RM-107', rule: p.name, reason: p.msg, message: p.msg });
        }
      }
    }
  });

  return violations;
}

export function auditDirectory(rootDir) {
  const baseDir = path.resolve(rootDir);
  const files = walkFiles(baseDir, baseDir);
  const violations = [];

  for (const file of files) {
    const content = fs.readFileSync(file.full, 'utf8');
    violations.push(...auditSource(file.rel, content));
  }

  return {
    clean: violations.length === 0,
    filesScanned: files.length,
    violationsCount: violations.length,
    violations,
  };
}
