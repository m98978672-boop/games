// Requires playwright-core and a local Chromium. Same setup as browser.cjs.
const {chromium} = require('playwright-core');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  try {
    const page=await browser.newPage({viewport:{width:1000,height:700}}); const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(process.env.DD_URL || 'http://127.0.0.1:4173/dead-district/');
    await page.waitForFunction(()=>window.DD_STATE);
    const locate=async kind=>page.evaluate(kind=>{
      const s=DD_STATE; s.zombies=[];s.npcs=[];
      const c=Object.values(s.world.containers).find(c=>c.kind===kind && [[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>s.world.isWalkable(c.tx-dx,c.ty-dy)));
      const [dx,dy]=[[1,0],[-1,0],[0,1],[0,-1]].find(([dx,dy])=>s.world.isWalkable(c.tx-dx,c.ty-dy));
      Object.assign(s.player,{x:c.tx-dx,y:c.ty-dy,fx:dx,fy:dy,inVehicleId:''});return c.tx+','+c.ty;
    },kind);
    const chest=await locate('chest'); await page.keyboard.press('e');
    await page.locator('#storage-overlay').waitFor({state:'visible'});
    assert.equal(await page.locator('#storage-title').textContent(),'СУНДУК');
    assert.ok(await page.locator('#storage-contents button').count());
    // Put a known item into storage and pick it back up.
    const before=await page.evaluate(()=>DD.Systems.countItem(DD_STATE.inv,'canned_beans'));
    await page.locator('#storage-inventory button').filter({hasText:'Консервы с фасолью'}).first().click();
    assert.equal(await page.evaluate(()=>DD.Systems.countItem(DD_STATE.inv,'canned_beans')),before-1);
    await page.locator('#storage-contents button').filter({hasText:'Консервы с фасолью'}).first().click();
    assert.equal(await page.evaluate(()=>DD.Systems.countItem(DD_STATE.inv,'canned_beans')),before);
    // Equipped weapon cannot vanish; it remains in the inventory.
    await page.locator('#storage-inventory button').filter({hasText:'Бейсбольная бита'}).click();
    assert.match(await page.locator('#storage-message').textContent(),/оружие/);
    assert.equal(await page.evaluate(()=>DD.Systems.countItem(DD_STATE.inv,'baseball_bat')),1);
    await page.locator('#storage-inventory button').filter({hasText:'Консервы с фасолью'}).first().click();
    const stored=await page.evaluate(k=>JSON.stringify(DD_STATE.storage[k]),chest);
    await page.keyboard.press('Escape'); await page.locator('#btn-save').click(); await page.locator('#btn-load').click();
    assert.equal(await page.evaluate(k=>JSON.stringify(DD_STATE.storage[k]),chest),stored,'содержимое сохраняется');
    await locate('chest'); await page.keyboard.press('e');
    assert.equal(await page.evaluate(k=>JSON.stringify(DD_STATE.storage[k]),chest),stored,'повторное открытие не генерирует лут');
    await page.locator('#storage-close').click();
    await locate('shelf'); await page.keyboard.press('e');
    assert.equal(await page.locator('#storage-title').textContent(),'ПОЛКА');
    await page.setViewportSize({width:375,height:667});
    const fits=await page.locator('.storage-card').evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;});
    assert.ok(fits,'интерфейс помещается на экране телефона');
    assert.ok(await page.locator('#storage-contents button').first().isVisible());
    await page.locator('#storage-close').click();
    assert.deepEqual(errors,[]);
    console.log('[dead-district storage browser] OK');
  } finally { await browser.close(); }
})().catch(err=>{console.error(err);process.exitCode=1;});
