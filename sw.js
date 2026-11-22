// CGMK offline shell. Network-first HTML avoids serving stale church schedules.
const CACHE='cgmk-shell-v2';
const CORE=['/index.html','/about.html','/media.html','/contact.html','/give.html','/offline.html','/site.webmanifest','/css/cgmk-home.css','/css/cgmk-calendar.css','/js/cgmk-home.js','/js/cgmk-about.js','/js/cgmk-calendar.js'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(async cache=>{
    await Promise.allSettled(CORE.map(url=>cache.add(url)));
    await self.skipWaiting();
  }));
});
self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()]));
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>{
      if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{});}
      return response;
    }).catch(async()=> (await caches.match(request))||(await caches.match('/offline.html'))));
    return;
  }
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
    if(response.ok && ['style','script','image','font'].includes(request.destination)){
      caches.open(CACHE).then(cache=>cache.put(request,response.clone())).catch(()=>{});
    }
    return response;
  })));
});
