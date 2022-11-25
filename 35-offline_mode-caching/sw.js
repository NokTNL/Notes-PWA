// We can cache assets after the SW has been installed
// You probably want to cache assets that do not change much over time, like the UI wireframe, icons, fonts etc.
//    - These are called the 'app shell' assets
self.addEventListener("install", (event) => {
  console.log("service worker installed", event);
  // The browser may shut down the SW prematurely before all the caches are done
  //  - It does NOT work if you pass an async function --- the event listener does not wait for the returned promise to be resolved!
  // However, the "install" & "activate" event triggered by SW is an `ExtendableEvent` that has a special method, `waitUntil`
  // https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil
  // You can pass in a Promise into `waitUntil`, and the browser will wait until the Promise is resolved before inactivating the SW

  event.waitUntil(
    // Use the CacheStorage API via `caches`; it is a property of the global object
    // https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage/open
    // `caches.open()` will open the named cache if it exists, or create a new cache that has the name of the string you pass in if it doesn't exist yet
    // This is asynchronous so will return a Promise that resolves to the newly created Cache object
    caches.open("site-static").then(
      // `cache` is the Cache object opened/created: https://developer.mozilla.org/en-US/docs/Web/API/Cache
      async (cache) => {
        // Now we can add URLs we want to cache into the `cache` object
        // Use `add` for a single item, or `addAll` for an array of items
        // The URL will be fetched and then have the response stored in CacheStorage
        // This will create key-value pairs in the CacheStorage, key = the URL; value = the cached asset
        await cache.addAll([
          "/",
          "/index.html", // Without a server to resolve '/' to '/index.html', the browser does not know the difference. Therefore, cache both
          "/js/app.js",
          "/js/ui.js",
          "/js/materialize.min.js",
          "/css/styles.css",
          "/css/materialize.min.css",
          "/img/dish.png",
          "https://fonts.googleapis.com/icon?family=Material+Icons",
          "https://fonts.gstatic.com/s/materialicons/v139/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2",
        ]);
        console.log("All shell assets cached");
      }
    )
  );
});

self.addEventListener("activate", (event) => {
  console.log("service worker activated", event);
});

self.addEventListener("fetch", (event) => {
  console.log("fetch event", event);
  // The event passed in here is a `FetchEvent` that has a special method, `respondWith()`, allowing you to INTERCEPT requests and send back an alternative response (instead of sending the request to the server)
  // You can pass in a Response object or a Promise that resolves to a Response object
  event.respondWith(
    // `caches.match` accepts a URL string or a Request object (which has a `url` field, then it looks into all the keys in CacheStorage to see if key matches our URL
    // It is ASYNCHRONOUS; returns a Promise that resolves to a Response object --> what is needed by `FetchEvent.respondWith` !
    // https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage/match
    caches.match(event.request).then(
      // The resolved value will be a Response that entails the matching asset, or `undefiend` if nothing matches
      (response) => {
        // If something matches:
        if (response) return response; // this will be picked up as the resolved value --> 'instant' resolution by our service worker
        // If `undefined`, we will need to 're-fetch' for our browser
        // This can be done by the fetch() API, which alternatively accepts a Request object
        // also remember, fetch() resolves to Promise<Response> !
        return fetch(event.request); // this will return a PENDING promise --> resolved until our real server has responded
      }
    )
  );
});
