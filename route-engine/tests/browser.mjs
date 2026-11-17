// Optional browser smoke: reuses Frontline's dev dependencies, adds none to this prototype.
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here=dirname(fileURLToPath(import.meta.url));
const require=createRequire(resolve(here,'../../frontline-command/package.json'));
const {default:chromium,inflate}=await import(pathToFileURL(require.resolve('@sparticuz/chromium')));
const {chromium:playwright}=require('playwright-core');
const source=await readFile(resolve(here,'../src/router.mjs'));
const server=http.createServer((req,res)=>{
  if(req.url==='/router.mjs') {res.writeHead(200,{'content-type':'text/javascript'}); res.end(source);}
  else if(req.url==='/') {res.writeHead(200,{'content-type':'text/html'}); res.end('<!doctype html><title>route test</title>');}
  else res.writeHead(404).end();
});
let browser;
try {
  await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok);});
  const libs=resolve(await inflate(resolve(dirname(require.resolve('@sparticuz/chromium')),'../bin/al2023.tar.br')),'lib');
  browser=await playwright.launch({executablePath:process.env.FRONTLINE_CHROMIUM_PATH||await chromium.executablePath(),args:chromium.args,headless:true,env:{...process.env,LD_LIBRARY_PATH:[libs,process.env.LD_LIBRARY_PATH].filter(Boolean).join(':')}});
  const page=await browser.newPage(), errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  const result=await page.evaluate(async()=>{
    const {createSnapshot,beginSearch}=await import('/router.mjs');
    const graph=createSnapshot({nodes:['a','b'],edges:[{id:'e',from:'a',to:'b',cost:1,portal:{id:'d',kind:'door',state:'closed',width:5,openable:true,openCost:2}}],revision:'v1'});
    const job=beginSearch(graph,{from:'a',to:'b',radius:1});let r;
    do {r=job.step(1);} while(r.status==='running');
    return r;
  });
  assert.equal(result.status,'found');assert.equal(result.cost,3);assert.equal(result.actions[0].action,'open-and-cross');assert.deepEqual(errors,[]);
  console.log('route engine: Chromium module import and closed-door graph search passed');
} finally {if(browser)await browser.close();if(server.listening)await new Promise(r=>server.close(r));}
