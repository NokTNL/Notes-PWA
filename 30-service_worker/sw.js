// The service worker has special events:

// 'install' event
// - Ther service worker is installed after registration, which triggers an install event
// - The browser WON'T re-install (and therefore not activate) the same service worker when you reload the page, UNLESS you change the code of the service worker file (including adding/removing a line comment!)
// - `self` in service worker file refers to the service worker itself
self.addEventListener("install", (event) => {
  console.log("service worker installed", event);
});

// 'activate' event
// - When there's no service worker registered before, the browser will register --> 'install' --> 'activate' the service worker
// - If we make a change to the service worker and reload the page, it will install the new service worker but NOT activate it.
//      - This is because the app that has been opened may still be using the old, activated service worker. Using a new service worker may break the running app.
//      - The newly installed service worker will only be activated when all tabs that uses this service worker is closed and re-opened
self.addEventListener("activate", (event) => {
  console.log("service worker activated", event);
});

// 'fetch' event
// - Whenever the browser fetches something, this event will be fired and you can potentially intercept it
// - this is needed to make the app work offline
self.addEventListener("fetch", (event) => {
  console.log("fetch event", event);
});
