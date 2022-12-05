// Because now we use the service worker to intercept files request, all the assets will become STALE; it will be always be version that the SW has cached
// The only way to make the browser to use a new version of files is to change to a new service worker (which will be installed --> caching the new assets)
// We can force it by updating the cache name (e.g. a new version number) for each time updating our assets:
const STATIC_CACHE_NAME = "site-static-v1";
const DYNAMIC_CACHE_NAME = "site-dynamic-v1";

self.addEventListener("install", (event) => {
  console.log("service worker installed", event);

  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(async (cache) => {
      await cache.addAll([
        "/",
        "/index.html",
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
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("service worker activated", event);
  // Even if we make a new SW re-installed and cached the new files, the OLD cached files are still in CacheStorage
  // When we try to `caches.match` them, it may return the old cache
  //    - NOTE: you can actually speicfy which cache to search into in the `cacheName` option of `caches.match`
  // Here you can just delete all of the old caches that does not match our new cache name
  // !!! This should be done at the new SW's 'activate' event , not 'install', otherwise it may delete caches that are still in use in the old activated SW!
  // !!! Remember to use `event.waitUntil` here to make it wait for our Promise, otherwise the browser may pre-maturely shut down the SW before your jobs are done
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  console.log("fetch event", event);

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log("Used cached assets", response);
        return response;
      }
      /**
       * Dynamic caching
       */
      // We can make our caching even smarter. Let say the client requests for an asset that is not in our pre-cached 'app shell' assets
      // Instead of re-fetching them every time, we can make newly requested assets to be stored into our cache as well

      // if request url has no matches in cache --> response === undefined:
      return dynamicallyCache(event.request);
    })
  );
});

async function dynamicallyCache(request) {
  const response = await fetch(request);
  // !!! Use a different cache name to avoid conflict with the static cache
  const dynamicCache = await caches.open(DYNAMIC_CACHE_NAME);
  // ??? Why don't we just cache.add(), as it will fetch & cache the asset for us?
  //  - It is because cache.add() returns a Promise that resolves to `undefined`, then we cannot make the responded assets usable on the screen anymore
  //  - In general, a Response can only be read ONCE; once read, it is not usable anymore
  //  - Therefore, we need to use `Cache.put` here, store a CLONED response in the cache, and return a Promise with the original Response
  // NOTE: sometimes the browser has extensions that also dispatch fetch requests, but the URLs fetched starts with something like `chrome-extension://` and is not allowed in `cache.put` and will throw errors
  //    - Just add a condition to filter it
  if (request.url.startsWith("http")) {
    console.log(
      `Fetched new assets and stored in ${DYNAMIC_CACHE_NAME}`,
      response
    );
    await dynamicCache.put(request.url, response.clone());
    await limitDynamicCacheSize(3);
  }
  return response;
}

/**
 * Limit dynamic cache size
 */
// If we keep caching non-shell assets, the dynamic cache can grow to very big
// We can trim the older ones e.g. the like below:
const limitDynamicCacheSize = async (maxSize) => {
  const dynamicCache = await caches.open(DYNAMIC_CACHE_NAME);
  const keys = await dynamicCache.keys();
  if (keys.length > maxSize) {
    // Delete the oldest, then call itself recursively so it will delete until it is <= maxSize (may not be the most efficient way to implement this but will do for now)
    await dynamicCache.delete(keys[0]);
    await limitDynamicCacheSize(maxSize);
  }
};
