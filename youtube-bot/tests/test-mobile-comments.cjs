'use strict';
const assert = require('node:assert/strict');
const {videoId, readOwnedComments} = require('../mobile-comments.js');
(async () => {
  assert.equal(videoId('https://youtu.be/jxXJm327cX8?t=2'), 'jxXJm327cX8');
  assert.equal(videoId('https://www.youtube.com/shorts/jxXJm327cX8'), 'jxXJm327cX8');
  assert.equal(videoId('https://m.youtube.com/watch?v=jxXJm327cX8'), 'jxXJm327cX8');
  for (const value of ['https://youtube.com.evil.example/watch?v=jxXJm327cX8', 'javascript:abc', 'not-an-id'])
    assert.throws(() => videoId(value));
  const requests = [];
  const responses = [
    {items:[{id:'owner',snippet:{title:'Зуза'}}]},
    {items:[{snippet:{channelId:'owner',title:'Обзор'}}]},
    {items:[{snippet:{topLevelComment:{snippet:{authorChannelId:{value:'viewer'},textDisplay:'<script>not executable</script>'}}}}]},
  ];
  const fetcher = async (url, options) => { requests.push([url, options]); return {ok:true, json:async()=>responses.shift()}; };
  const result = await readOwnedComments('token', 'jxXJm327cX8', fetcher);
  assert.equal(result.comments[0], '<script>not executable</script>');
  assert.equal(result.channel, 'Зуза');
  assert.equal(requests.length, 3);
  assert.ok(requests.every(([url, opts]) => url.startsWith('https://www.googleapis.com/youtube/v3/') && !url.includes('token') && opts.headers.Authorization === 'Bearer token'));
  const blocked = [ {items:[{id:'owner'}]}, {items:[{snippet:{channelId:'other'}}]} ];
  let count = 0;
  await assert.rejects(readOwnedComments('token', 'jxXJm327cX8', async () => ({ok:true,json:async()=>{count++; return blocked.shift();}})), /не принадлежит/);
  assert.equal(count, 2);
  console.log('Mobile read-only comments tests passed');
})().catch(err => {console.error(err); process.exitCode = 1;});
