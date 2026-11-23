"use strict";
// One-off online experiment. Browser request filtering is NOT an OS firewall.
// No secrets or checkout are mounted. Do not run on a privileged/personal host.
const readline = require('node:readline');
const {chromium} = require('playwright');
const HOME = 'https://classic.minecraft.net/';
const KEYS = new Set(['KeyW','KeyA','KeyS','KeyD','KeyB','Space','Escape']);
const emit = x => process.stdout.write(JSON.stringify(x) + '\n');
async function main() {
  const browser = await chromium.launch({headless:true});
  const context = await browser.newContext({viewport:{width:800,height:600},serviceWorkers:'block',acceptDownloads:false});
  await context.route('**/*', route => {
    const u = new URL(route.request().url());
    // This restricts Playwright HTTP requests, not browser/kernel network access.
    return u.protocol === 'https:' && u.hostname === 'classic.minecraft.net' && (!u.port || u.port === '443')
      ? route.continue() : route.abort();
  });
  await context.routeWebSocket('**/*', ws => ws.close());
  const page = await context.newPage();
  page.on('popup', p => p.close().catch(() => {}));
  page.on('dialog', d => d.dismiss().catch(() => {}));
  let x = 400, y = 300, step = 0;
  try {
    await page.goto(HOME, {waitUntil:'domcontentloaded',timeout:20000});
    // Setup is scripted, not a model action: use a disposable nickname only if
    // a single visible text field and Start control can be identified. Never
    // enter credentials, follow a link, or guess coordinates for the form.
    let setup = 'start_form_not_found';
    const fields = page.locator('input:not([type]), input[type=text]');
    const start = page.getByRole('button', {name: /^start$/i});
    try {
      await start.first().waitFor({state:'visible',timeout:25000});
      const visible = [];
      for (let i=0; i<Math.min(await fields.count(),10); i++) if (await fields.nth(i).isVisible()) visible.push(fields.nth(i));
      if (visible.length === 1 && await start.count() === 1) {
        await visible[0].fill('KvenyaTest');
        await start.click({timeout:5000});
        setup = 'start_clicked_not_verified';
        await page.waitForTimeout(3000);
      }
    } catch (_) { setup = 'start_form_not_found_or_timeout'; }
    await page.mouse.move(x,y);
    async function observe() {
      const png = await page.screenshot({type:'png',timeout:10000});
      if (png.length > 2000000) throw Error('screenshot too large');
      emit({type:'observation',step,width:800,height:600,setup,screenshot_png_base64:png.toString('base64')});
    }
    await observe();
    const lines = readline.createInterface({input:process.stdin,crlfDelay:Infinity});
    for await (const line of lines) {
      if (line.length > 4096) throw Error('request too large');
      const req = JSON.parse(line);
      if (req.type === 'close' && Object.keys(req).length === 1) break;
      if (req.type !== 'step' || Object.keys(req).some(k => !['type','action'].includes(k)) || !req.action || typeof req.action !== 'object' || Array.isArray(req.action)) throw Error('invalid request');
      const a=req.action;
      if (Object.keys(a).some(k => !['keys','duration_ms','look','click','button'].includes(k))) throw Error('invalid action');
      const keys=a.keys ?? [], duration=a.duration_ms ?? 250, look=a.look ?? null, click=a.click ?? null, button=a.button ?? 'left';
      if (!Array.isArray(keys) || keys.length > 2 || new Set(keys).size !== keys.length || keys.some(k => !KEYS.has(k))) throw Error('invalid keys');
      if (!Number.isInteger(duration) || duration < 50 || duration > 2000) throw Error('invalid duration');
      if (look !== null && (!Array.isArray(look) || look.length !== 2 || !look.every(Number.isInteger) || look.some(n => Math.abs(n)>100))) throw Error('invalid look');
      if (click !== null && (!Array.isArray(click) || click.length !== 2 || click[0] !== 400 || click[1] !== 300)) throw Error('invalid click');
      if (!['left','right'].includes(button) || (a.button !== undefined && click === null)) throw Error('invalid button');
      if (++step > 12) throw Error('step limit');
      try {
        for (const k of keys) await page.keyboard.down(k);
        if (click) { x=400; y=300; await page.mouse.click(x,y,{button}); }
        if (look) { x=Math.max(0,Math.min(799,x+look[0])); y=Math.max(0,Math.min(599,y+look[1])); await page.mouse.move(x,y); }
        await page.waitForTimeout(duration);
      } finally { for (const k of keys) await page.keyboard.up(k).catch(()=>{}); }
      await observe();
    }
  } finally { await context.close(); await browser.close(); }
}
main().catch(e => { console.error('Minecraft experiment stopped:',String(e.message).slice(0,200)); process.exitCode=1; });
