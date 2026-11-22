// Регрессия: автопост публикует файл ленты и все его обложки вместе.
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { ensureNewsCovers, mergeNewsFeeds } from '../scripts/auto-post-news.mjs';
import { loadGamesAntivirus } from '../scripts/scan-submission-antivirus.mjs';

const av = await loadGamesAntivirus();
const root = await mkdtemp(path.join(os.tmpdir(),'games-news-covers-'));
const make = (id, code, title = 'Новая статья о науке') => ({id:`auto-${id}`,code,title,category:'science',sourceName:'Редакция',
  sourceUrl:`https://example.com/${id}`, publishedAt:'2026-11-20T09:00:00Z', image:`site/assets/news/${code.toLowerCase()}.svg`});
try {
  const dir = path.join(root,'site/assets/news'); await mkdir(dir,{recursive:true});
  const keep=make('keep','S-100'), fresh=make('fresh','S-101', 'Исследование: «небо & море»');
  await writeFile(path.join(dir,'s-100.svg'),'редакционная обложка');
  assert.equal(await ensureNewsCovers([keep,fresh],root,av),1);
  assert.equal(await readFile(path.join(dir,'s-100.svg'),'utf8'),'редакционная обложка');
  const svg = await readFile(path.join(dir,'s-101.svg'),'utf8');
  assert(svg.includes('S-101') && svg.includes('&amp;') && svg.includes('небо'));
  assert.notEqual(av.scanCoverDataUrl('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)).verdict,'blocked');
  assert.equal(await ensureNewsCovers([keep,fresh],root,av),0);
  await assert.rejects(ensureNewsCovers([{...fresh,image:'site/assets/../../outside.svg'}],root,av),/Небезопасный путь/);
  await assert.rejects(ensureNewsCovers([{...fresh,image:'site/assets/news/photo.jpg'}],root,av),/редакционная обложка/);
  await assert.rejects(ensureNewsCovers([{...fresh,code:'S-105',image:'site/assets/news/s-106.svg'}],root,av),/редакционная обложка/);
  await assert.rejects(ensureNewsCovers([make('bad','S-102')],root,{scanCoverDataUrl:()=>({verdict:'blocked'})}),/безопасности/);
  const existing=make('old','W-900'), a=make('one','W-934'), b=make('two','W-934');
  const merged=mergeNewsFeeds([existing],[a,b],av,['W-934','W-935']);
  assert.equal(merged.added,2); assert.equal(a.code,'W-936'); assert.equal(b.code,'W-937');
  assert.equal(a.image,'site/assets/news/w-936.svg'); assert.equal(existing.code,'W-900');
  assert.equal(await ensureNewsCovers(merged.items,root,av),3);
  await assert.rejects(ensureNewsCovers([{...fresh,id:'editorial',code:'S-103',image:'site/assets/news/s-103.svg'}],root,av),/редакционная обложка/);
  const wrap=make('wrap','W-999'); mergeNewsFeeds([], [wrap],av,['W-999']); assert.equal(wrap.code,'W-000');
  const photo=make('photo','W-998'); photo.image='site/assets/news/real-photo.jpg';
  mergeNewsFeeds([], [photo],av,['W-998']); assert.equal(photo.image,'site/assets/news/real-photo.jpg');
  console.log('✓ Обложки: создание, безопасность, отсутствие перезаписи и коллизии кодов');
} finally { await rm(root,{recursive:true,force:true}); }
