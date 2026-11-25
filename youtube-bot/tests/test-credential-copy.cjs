'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../credential-copy.html'), 'utf8');
assert.match(html, /connect-src 'none'/);
// Some Android pickers classify downloaded JSON as an unknown MIME type.
// Leave the picker unrestricted; the script still validates the file contents.
assert.doesNotMatch(html.match(/<input\s+id="file"[^>]*>/i)[0], /\baccept=/i);
assert.doesNotMatch(html, /<script[^>]+src=/i);
const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const elements = Object.fromEntries(['file','copy','status'].map(id => [id, {files:[], value:'', disabled:false, textContent:'', events:{}, addEventListener(event, handler){this.events[event]=handler;}}]));
let clipboard = '';
vm.runInNewContext(js, {document:{getElementById:id=>elements[id]}, navigator:{clipboard:{writeText:async s=>{clipboard=s;}}}});
(async () => {
  const id='420623721440-bqjjh67vl8a78b6is9rrfhvolfbpab4i.apps.googleusercontent.com';
  elements.file.files=[{size:1,text:async()=>JSON.stringify({web:{client_id:id,client_secret:'local-only'}})}];
  await elements.file.events.change();
  assert.equal(elements.copy.disabled,false);
  await elements.copy.events.click();
  assert.equal(clipboard,'local-only');
  assert.equal(elements.copy.disabled,true);
  assert.ok(!elements.status.textContent.includes('local-only'));
  elements.file.files=[{size:1,text:async()=>JSON.stringify({web:{client_id:'wrong',client_secret:'private'}})}];
  await elements.file.events.change();
  assert.equal(elements.copy.disabled,true);
  console.log('Credential copy page tests passed');
})().catch(err=>{console.error(err);process.exitCode=1;});
