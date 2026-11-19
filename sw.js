/* فولو ثرو · إشعارات تذكير اليوميات */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
async function ftCfg(){
  try{ const c = await caches.open("ft-push"); const r = await c.match("/__ft"); return r ? await r.json() : {}; }catch(e){ return {}; }
}
self.addEventListener("push", e => {
  e.waitUntil((async () => {
    const c = await ftCfg(); let m = null;
    try{
      const sub = await self.registration.pushManager.getSubscription();
      if(c.api && sub){
        const r = await fetch(c.api, {method: "POST", headers: {"Content-Type": "text/plain;charset=utf-8"}, body: JSON.stringify({action: "pushMsg", endpoint: sub.endpoint})});
        const j = await r.json(); if(j && j.ok) m = j.data;
      }
    }catch(err){}
    let url = c.url || self.registration.scope;
    if(m && m.go) url += (url.indexOf("?") >= 0 ? "&" : "?") + "go=" + encodeURIComponent(m.go);
    await self.registration.showNotification((m && m.title) || "فولو ثرو", {
      body: (m && m.body) || "كيف كانت حصة اليوم؟ سجلي يوميتك.",
      icon: "icon-192.png", badge: "icon-192.png", lang: "ar", dir: "rtl", tag: "ft-" + ((m && m.at) || Date.now()), data: {url}
    });
  })());
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil(self.clients.matchAll({type: "window", includeUncontrolled: true}).then(ws => {
    for(const w of ws){ if("navigate" in w && "focus" in w) return w.navigate(url).then(x => (x || w).focus()).catch(() => self.clients.openWindow(url)); }
    return self.clients.openWindow(url);
  }));
});
