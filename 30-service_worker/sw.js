// The service worker has special events:

// 'install' & 'activate' event
// - The service worker is installed after registration, which triggers an install event (and ACTIVATE it straight away)
// - The browser will remember what service worker has been activated, and keep it installed + activated even after reload
// - If you reload the page:
//    - It will re-register the service worker file
//    - If the browser finds out the newly registered service worker is the SAME service worker, it WON'T re-install it (it has already kept the SW installed & actiavted from last load!)
//    - If a NEW service worker is detected (including adding/removing a line comment!), the browser WILL install it but NOT activating it yet. Instead, it keeps the old one activated
//        - This is because the app that has been opened may still be using the old, activated service worker. Using a new service worker may break the running app.
//        - The newly installed service worker will only be (re-installed &) activated next time after all tabs using the old service worker has been closed
// Summary:
//    - On reload, the browser always use the old SW that has been installed + activated from last load
//    - Changing the service worker only affects what is NEWLY INSTALLED on reload --> will only be activated after closing all tabs
// - `self` in service worker file refers to the service worker itself
self.addEventListener("install", (event) => {
  console.log("service worker installed", event);
});

self.addEventListener("activate", (event) => {
  console.log("service worker activated", event);
});

// 'fetch' event
// - Whenever the browser fetches something, this event will be fired and you can potentially intercept it
// - this is needed to make the app work offline
self.addEventListener("fetch", (event) => {
  console.log("fetch event", event);
});
