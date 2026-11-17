#!/usr/bin/env node
// Серверный / CI-антивирус Games: прогоняет 10-кратный GamesAntivirus по всем заявкам
// сообщества (site/community-games.json), новостям (site/news-feed.json) и указанным файлам/URL.
// Запуск:
//   node site/scripts/scan-submission-antivirus.mjs
//   node site/scripts/scan-submission-antivirus.mjs --file path/to/game.html
//   node site/scripts/scan-submission-antivirus.mjs --url https://example.github.io/game/
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const siteDir = path.join(repoRoot, 'site');

export async function loadGamesAntivirus() {
  const code = await readFile(path.join(repoRoot, 'site/game-antivirus.js'), 'utf8');
  const sandbox = {
    window: {},
    URL,
    URLSearchParams,
    TextEncoder,
    TextDecoder,
    Uint8Array,
    Uint32Array,
    DataView,
    Buffer,
    atob: (s) => Buffer.from(s, 'base64').toString('binary'),
    btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    Date,
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(code, sandbox);
  if (!sandbox.window.GamesAntivirus) {
    throw new Error('Failed to initialize window.GamesAntivirus');
  }
  return sandbox.window.GamesAntivirus;
}

export async function scanCommunitySubmissions(av) {
  const catalogPath = path.join(repoRoot, 'site/community-games.json');
  let raw = {};
  try {
    raw = JSON.parse(await readFile(catalogPath, 'utf8'));
  } catch (err) {
    throw new Error(`Invalid community-games.json: ${err.message}`);
  }
  const games = Array.isArray(raw.games) ? raw.games : [];
  const results = [];

  for (const game of games) {
    const entry = { id: game.id || 'unknown', title: game.title || 'Без названия', verdict: 'clean', issues: [] };
    const play = String(game.play || '').trim();

    if (/^https?:\/\//i.test(play)) {
      const rep = av.scanGameSync({ title: game.title, sourceType: 'url', playUrl: play });
      if (rep.verdict === 'blocked') {
        entry.verdict = 'blocked';
        entry.issues.push(...rep.blockedReasons);
      }
    } else if (play) {
      const absPlay = path.resolve(siteDir, play);
      if (!absPlay.startsWith(`${repoRoot}${path.sep}`)) {
        entry.verdict = 'blocked';
        entry.issues.push(`Path traversal detected: ${play}`);
      } else {
        const html = await readFile(absPlay, 'utf8');
        let coverDataUrl = '';
        if (game.cover && /\.svg$/i.test(game.cover)) {
          const absCover = path.resolve(siteDir, game.cover);
          if (absCover.startsWith(`${repoRoot}${path.sep}`)) {
            try {
              await access(absCover);
              const svgText = await readFile(absCover, 'utf8');
              coverDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
            } catch (err) {
              coverDataUrl = err ? '' : '';
            }
          }
        }
        const rep = av.scanGameSync({ title: game.title, sourceType: 'html', htmlCode: html, coverDataUrl });
        if (rep.verdict === 'blocked') {
          entry.verdict = 'blocked';
          entry.issues.push(...rep.blockedReasons);
        }
      }
    }
    results.push(entry);
  }
  return results;
}

export async function scanNewsFeedFile(av) {
  const newsPath = path.join(repoRoot, 'site/news-feed.json');
  let feed = null;
  try {
    await access(newsPath);
    feed = JSON.parse(await readFile(newsPath, 'utf8'));
  } catch (err) {
    return err ? [] : [];
  }
  const items = Array.isArray(feed.items) ? feed.items : [];
  return items.map((item) => {
    const rep = av.scanNewsItemSync(item);
    return {
      id: item.id || 'unknown',
      title: item.title || '',
      verdict: rep.verdict,
      issues: rep.reasons,
    };
  });
}

async function main() {
  const args = process.argv.slice(2);
  const av = await loadGamesAntivirus();

  const fileIdx = args.indexOf('--file');
  if (fileIdx >= 0 && args[fileIdx + 1]) {
    const target = path.resolve(args[fileIdx + 1]);
    const content = await readFile(target, 'utf8');
    const isSvg = /\.svg$/i.test(target);
    const rep = isSvg
      ? av.scanCoverDataUrl(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(content)}`)
      : av.scanGameSync({ title: path.basename(target), sourceType: 'html', htmlCode: content });
    console.log(JSON.stringify({ target, verdict: rep.verdict, risk: rep.riskScore ?? rep.risk ?? 0, reasons: rep.blockedReasons || rep.reasons || [] }, null, 2));
    if (rep.verdict === 'blocked') process.exit(1);
    return;
  }

  const urlIdx = args.indexOf('--url');
  if (urlIdx >= 0 && args[urlIdx + 1]) {
    const playUrl = args[urlIdx + 1];
    const rep = av.scanGameSync({ title: playUrl, sourceType: 'url', playUrl });
    console.log(JSON.stringify({ playUrl, verdict: rep.verdict, riskScore: rep.riskScore, blockedReasons: rep.blockedReasons, warnReasons: rep.warnReasons }, null, 2));
    if (rep.verdict === 'blocked') process.exit(1);
    return;
  }

  const communityResults = await scanCommunitySubmissions(av);
  const newsResults = await scanNewsFeedFile(av);
  const blockedGames = communityResults.filter((r) => r.verdict === 'blocked');
  const blockedNews = newsResults.filter((r) => r.verdict === 'blocked');

  console.log(`Games CI Antivirus v${av.VERSION}: scanned ${communityResults.length} community games (blocked: ${blockedGames.length}) + ${newsResults.length} news posts (blocked: ${blockedNews.length}).`);
  for (const item of [...blockedGames, ...blockedNews]) {
    console.error(`  [BLOCKED] ${item.id} (${item.title}): ${item.issues.join(' | ')}`);
  }
  if (blockedGames.length > 0 || blockedNews.length > 0) {
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
