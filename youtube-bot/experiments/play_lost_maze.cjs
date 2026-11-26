const {chromium} = require('playwright');
const fs = require('node:fs');
const out = process.argv[2];
const moves = [[-1,0,90,'влево'],[0,1,0,'вперёд'],[1,0,-90,'вправо'],[0,-1,180,'назад']];
function route(grid,x,z) {
  const size=grid.length, q=[[x,z,[]]], seen=new Set([`${x},${z}`]);
  for(let i=0;i<q.length;i++) {
    const [a,b,path]=q[i];
    if(a===size-1&&b===size-1)return path;
    moves.forEach(([dx,dz],id)=>{
      const nx=a+dx,nz=b+dz,key=`${nx},${nz}`;
      if(grid[a][b][id]&&grid[nx]?.[nz]&&!seen.has(key)) {seen.add(key);q.push([nx,nz,[...path,id]]);}
    });
  }
  throw Error('No route in the generated maze');
}
async function main(){
  const browser=await chromium.launch({args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const ctx=await browser.newContext({viewport:{width:1280,height:720},recordVideo:{dir:out,size:{width:1280,height:720}}});
  const page=await ctx.newPage(), video=page.video(), errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  const start=Date.now(), events=[];
  const log=(kind,details={})=>{const event={kind,ms:Date.now()-start,...details};events.push(event);console.log(JSON.stringify(event));};
  const state=()=>page.evaluate(()=>({grid:mazeObj,level:currentLevel,x:hero.Camera.x,z:hero.Camera.z,ready:currentLevelIsReady,size:blockSize}));
  let furthest=1;
  try {
    await page.goto('http://127.0.0.1:8765/collection/lost-in-the-maze-3d/');
    await page.waitForFunction(()=>typeof hero!=='undefined'&&hero&&currentLevelIsReady,{},{timeout:15000});
    await page.screenshot({path:`${out}/start.png`});
    const deadline=Date.now()+6*60*1000;
    let stuck=0;
    while(Date.now()<deadline&&furthest<4){
      const s=await state();
      if(s.level>furthest){furthest=s.level;log('portal',{level:s.level});stuck=0;}
      if(furthest>=4)break;
      if(!s.ready){log('retry',{level:s.level});await page.waitForFunction(()=>currentLevelIsReady,{},{timeout:12000});continue;}
      const x=Math.round(s.x/s.size),z=Math.round(-s.z/s.size);
      const path=route(s.grid,x,z);
      if(!path.length){await page.waitForTimeout(300);if(++stuck>12)throw Error('Portal did not advance level');continue;}
      const [dx,dz,yaw,direction]=moves[path[0]], tx=(x+dx)*s.size,tz=-(z+dz)*s.size;
      log('route_choice',{level:s.level,direction,x,z});
      // Use the actual camera and movement update; never mutate position, health or level.
      await page.evaluate(yaw=>{angleY=yaw;},yaw);
      await page.keyboard.down('ArrowUp');
      let reached=false;
      try{
        await page.waitForFunction(({s,tx,tz,dx,dz})=>currentLevel!==s.level||!currentLevelIsReady||
          (dx ? (hero.Camera.x-tx)*dx>=-.18 : (tz-hero.Camera.z)*dz>=-.18),{s:{level:s.level},tx,tz,dx,dz},{timeout:2200});
        reached=true;
      }catch(e){if(e.name!=='TimeoutError')throw e;}
      finally{await page.keyboard.up('ArrowUp');}
      if(!reached){log('blocked',{level:s.level});if(++stuck>8)throw Error('No movement progress after map-to-world conversion');}else stuck=0;
    }
    await page.screenshot({path:`${out}/end.png`});
    if(furthest<4)throw Error('Did not reach the three-portal milestone');
  } finally {
    await ctx.close();
    await video.saveAs(`${out}/recording.webm`);
    fs.writeFileSync(`${out}/trace.json`,JSON.stringify({game:'Lost in the Maze 3D',furthest,events,errors},null,2));
    await browser.close();
  }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
