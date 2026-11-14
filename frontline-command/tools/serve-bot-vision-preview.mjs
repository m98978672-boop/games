// Explicit opt-in preview only. Does not change feature_flags.json or publish.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo=resolve(fileURLToPath(new URL('../..',import.meta.url)));
const port=Number(process.env.PORT||8000);
if(!Number.isInteger(port)||port<1||port>65535)throw Error('invalid PORT');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.ogg':'audio/ogg','.mp3':'audio/mpeg','.wav':'audio/wav'};
const allowed=name=>name==='shared/theme.css'||name==='frontline-command/index.html'||name==='frontline-command/style.css'||name==='frontline-command/cover.svg'||['frontline-command/src/','frontline-command/data/','frontline-command/assets/'].some(p=>name.startsWith(p));
http.createServer(async(req,res)=>{
  try{
    if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405).end();return;}
    const url=new URL(req.url,'http://preview.invalid');
    if(url.pathname==='/'){res.writeHead(302,{Location:'/frontline-command/index.html'}).end();return;}
    const name=decodeURIComponent(url.pathname).replace(/^\/+/, '');
    if(name.split(/[\\/]/).includes('..')||!allowed(name)){res.writeHead(404).end();return;}
    const path=resolve(repo,name);if(!path.startsWith(repo+sep))throw Error('path');
    let body=await readFile(path);
    if(name==='frontline-command/data/feature_flags.json'){
      const data=JSON.parse(body);
      for(const id of ['bot_obstacle_vision_v1','bot_surround_vision_v1','vehicle_visible_fire_v1']) {
        const flag=data.flags.find(f=>f.id===id);
        if(!flag||flag.enabled!==false)throw Error(`expected default-off flag ${id}`);
        flag.enabled=true;
      }
      body=Buffer.from(JSON.stringify(data));
    }
    if(name==='frontline-command/index.html'){
      const badge='<div role="status" style="position:fixed;bottom:5px;left:5px;z-index:9999;background:#173b28;color:#fff;padding:4px 7px;font:12px sans-serif;pointer-events:none">Тест: обзор ботов и обход включены · не публикация</div>';
      body=Buffer.from(body.toString('utf8').replace('</body>',`${badge}</body>`));
    }
    res.writeHead(200,{'content-type':mime[extname(path)]||'application/octet-stream','cache-control':'no-store'});
    res.end(req.method==='HEAD'?undefined:body);
  }catch{res.writeHead(404).end();}
}).listen(port,'0.0.0.0',()=>console.log(`Тест игры с обзором и обходом: http://0.0.0.0:${port}/frontline-command/index.html`));
