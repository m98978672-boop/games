import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
// Test the actual embedded helper without starting the live Deno HTTP server.
const source = readFileSync(new URL('../index.ts', import.meta.url), 'utf8');
const match = source.match(/function githubIdentityMismatches\(claims: Record<string, unknown>, now: number\): string\[\] \{[\s\S]*?\n\}/);
assert.ok(match, 'OIDC helper missing');
const js = match[0].replace('claims: Record<string, unknown>, now: number', 'claims, now').replace('): string[] {', ') {').replace('const mismatches: string[]', 'const mismatches');
const check = vm.runInNewContext(`(${js})`);
const now = 100000;
const base = {iss:'https://token.actions.githubusercontent.com', aud:'youtube-bot', repository:'m98978672-boop/games', ref:'refs/heads/main', workflow_ref:'m98978672-boop/games/.github/workflows/youtube-shorts-autopilot.yml@refs/heads/main', event_name:'schedule', iat:now, exp:now+300};
for (const workflow of ['youtube-shorts-autopilot.yml', 'youtube-longform-autopilot.yml']) {
  const claims = {...base, workflow_ref:`m98978672-boop/games/.github/workflows/${workflow}@refs/heads/main`};
  assert.equal(check(claims, now).length, 0);
  assert.equal(check({...claims,event_name:'workflow_dispatch'}, now).length, 0);
}
for (const [field, value] of Object.entries({iss:'https://evil.example',aud:'wrong',repository:'evil/games',ref:'refs/heads/feature',workflow_ref:'m98978672-boop/games/.github/workflows/youtube-experimental-smoke.yml@refs/heads/main',event_name:'pull_request',iat:now+61,exp:now-1})) {
  assert.ok(check({...base, [field]:value}, now).length, `accepted bad ${field}`);
}
assert.ok(check({...base, workflow_ref:base.workflow_ref.replace('@refs/heads/main','@refs/heads/feature')}, now).length);
assert.ok(source.indexOf('crypto.subtle.verify') < source.indexOf('const mismatches = githubIdentityMismatches'));
console.log('OIDC workflow policy tests passed');
