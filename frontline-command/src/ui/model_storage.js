import {importModelArchive} from './model_import.js';
// An opt-in inbox in the local preview server, not browser localStorage.
// Files are sent in small pieces; no model is executed or unpacked here.
const base=new URL('../../../__model_inbox/',import.meta.url);

// Only accept Dropbox file-request links; never persist or publish their
// bearer URLs. This is a handoff to Dropbox, not an in-page upload API.
export function dropboxRequestUrl(value) {
 try {
  const url = new URL(value.trim());
  if (url.protocol !== 'https:' || url.hostname !== 'www.dropbox.com' || url.port || url.username || url.password || !/^\/request\/[A-Za-z0-9_-]+\/?$/.test(url.pathname) || url.search || url.hash) return null;
  return url.href;
 } catch { return null; }
}
export function bindModelStorage(root,goBack){
 const input=root.querySelector('#model-file'),send=root.querySelector('#model-send'),back=root.querySelector('#model-back'),status=root.querySelector('#model-status'),files=root.querySelector('#model-files'),progress=root.querySelector('#model-progress');
 const requestInput=root.querySelector('#dropbox-request-url'), requestOpen=root.querySelector('#dropbox-request-open'), requestStatus=root.querySelector('#dropbox-request-status');
 requestInput.addEventListener('input',()=>{
  const url=dropboxRequestUrl(requestInput.value);
  requestOpen.hidden=!url;
  if(url){requestOpen.href=url;requestStatus.textContent='Откройте Dropbox и загрузите файлы на его странице.';}
  else {requestOpen.removeAttribute('href');requestStatus.textContent=requestInput.value.trim()?'Нужна ссылка вида https://www.dropbox.com/request/… без дополнительных параметров.':'Вставьте ссылку созданного запроса.';}
 });
 const importFile=root.querySelector('#model-import-file'),importButton=root.querySelector('#model-import'),importStatus=root.querySelector('#model-import-status'),importProgress=root.querySelector('#model-import-progress');
 importButton.onclick=async()=>{
  const file=importFile.files?.[0];if(!file){importStatus.textContent='Сначала выберите ZIP модели.';return;}
  importButton.disabled=true;importFile.disabled=true;back.disabled=true;
  try{
   await importModelArchive(file,{progress:(stage,fraction)=>{importProgress.value=Math.round(fraction*100);importStatus.textContent=`${stage==='verify'?'Проверка архива':'Сохранение файлов модели'}: ${importProgress.value}%. Не закрывайте страницу.`;}});
   importStatus.textContent='Файлы модели сохранены в кэше этого браузера. В обычной игре нейросеть не используется.';
  }catch(e){importStatus.textContent=`Сохранение не выполнено: ${e.message}. Проверьте архив и свободное место в браузере.`;}
  finally{importButton.disabled=false;importFile.disabled=false;back.disabled=false;}
 };
 let info=null,closed=false,busy=false,current=null,xhr=null;
 const explain=s=>({'file exists':'файл с таким именем уже загружен; переименуйте новый файл','storage full':'недостаточно места в хранилище','bad file name or size':'недопустимое имя или размер файла','invalid request':'недопустимый запрос','forbidden':'сервер отклонил запрос','wrong offset':'нарушен порядок блоков','upload not found':'сеанс загрузки потерян; начните заново','incomplete':'передан не весь файл','storage error':'ошибка записи в хранилище'}[s]||s);
 const say=s=>{if(!closed)status.textContent=s;};
 const draw=list=>{files.replaceChildren();if(!list.length){files.textContent='Пока файлов нет.';return;}for(const f of list){const li=document.createElement('li');li.textContent=`${f.name} — ${(f.size/1024/1024).toFixed(1)} МиБ`;files.appendChild(li);}};
 async function refresh(){
  try{const r=await fetch(new URL('status',base),{cache:'no-store'});if(!r.ok)throw Error();const d=await r.json();if(d.service!=='model-inbox-v1')throw Error();if(closed)return;info=d;draw(d.files);send.disabled=false;say('Хранилище доступно. Выберите файлы и нажмите «Загрузить».');}
  catch{if(closed)return;send.disabled=true;say('Сервер хранилища недоступен. Эта функция работает только в предпросмотре с сервером хранилища.');}
 }
 function header(extra={}){return {'X-Model-Token':info.token,...extra};}
 async function cancel(id){if(!id||!info)return;try{await fetch(new URL('cancel',base),{method:'POST',headers:header({'X-Upload-Id':id}),body:'',keepalive:true});}catch{}}
 async function request(endpoint,body,extra={}){
  const r=await fetch(new URL(endpoint,base),{method:'POST',headers:header(extra),body});let data={};try{data=await r.json();}catch{}
  if(!r.ok)throw Error(data.error||`HTTP ${r.status}`);return data;
 }
 function chunk(id,offset,blob,name,total){return new Promise((resolve,reject)=>{
  const x=new XMLHttpRequest();xhr=x;x.open('POST',new URL('chunk',base));
  x.setRequestHeader('X-Model-Token',info.token);x.setRequestHeader('X-Upload-Id',id);x.setRequestHeader('X-Upload-Offset',String(offset));
  x.upload.onprogress=e=>{const done=offset+(e.lengthComputable?e.loaded:0);const percent=Math.min(100,Math.floor(done/total*100));progress.value=percent;say(`Загружается ${name}: ${percent}%. Не закрывайте страницу.`);};
  x.onload=()=>{xhr=null;let data={};try{data=JSON.parse(x.responseText);}catch{}if(x.status===200)resolve(data);else reject(Error(data.error||`HTTP ${x.status}`));};
  x.onerror=()=>{xhr=null;reject(Error('сетевая ошибка'));};x.onabort=()=>{xhr=null;reject(Error('отменено'));};x.send(blob);
 });}
 send.onclick=async()=>{
  if(!info||busy)return;const selected=Array.from(input.files||[]);if(!selected.length){say('Сначала выберите один или несколько файлов.');return;}
  busy=true;send.disabled=true;input.disabled=true;let completed=0;
  try{
   for(const file of selected){
    if(closed)break;if(file.size>info.maxFile||file.size===0)throw Error('файл пустой или больше 600 МиБ');
    const start=await request('start',JSON.stringify({name:file.name,size:file.size}),{'Content-Type':'application/json'});current=start.id;
    if(closed){await cancel(current);current=null;break;}
    let offset=0;
    while(offset<file.size&&!closed){const end=Math.min(offset+start.chunkSize,file.size);const result=await chunk(current,offset,file.slice(offset,end),file.name,file.size);if(result.offset!==end)throw Error('неверное подтверждение блока');offset=end;}
    if(closed){await cancel(current);current=null;break;}
    const done=await request('finish','',{'X-Upload-Id':current});current=null;completed++;progress.value=100;say(`Загружен ${done.name}. SHA-256: ${done.sha256}`);
   }
   if(!closed){await refresh();say(`Готово: загружено файлов ${completed}. Сообщите в чате, что загрузка завершена.`);input.value='';}
  }catch(e){await cancel(current);current=null;if(!closed){await refresh();say(`Загрузка остановлена: ${explain(e.message)}. Успешно передано файлов: ${completed}.`);}}
  finally{busy=false;if(!closed){send.disabled=!info;input.disabled=false;}}
 };
 back.onclick=()=>{closed=true;xhr?.abort();if(current)void cancel(current);goBack();};
 void refresh();
}
