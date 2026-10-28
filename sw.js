const DB='CampoControlShare';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim());});
function saveShared(item){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('shared');r.onsuccess=()=>{const db=r.result;const tx=db.transaction('shared','readwrite');tx.objectStore('shared').put(item,'latest');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)};r.onerror=()=>reject(r.error)});}
self.addEventListener('fetch',event=>{
 const u=new URL(event.request.url);
 if(event.request.method==='POST' && u.pathname.endsWith('/share/')){
  event.respondWith((async()=>{
   const form=await event.request.formData();
   const text=[form.get('title'),form.get('text'),form.get('url')].filter(v=>typeof v==='string'&&v.trim()).join('\n');
   let file=null,name='',type='';
   for(const [key,value] of form.entries()){if(value instanceof File && value.size>0){file=value;name=value.name;type=value.type;break;}}
   await saveShared({text,file,name,type,created:Date.now()});
   return Response.redirect(new URL('./',self.registration.scope),303);
  })());
 }
});
