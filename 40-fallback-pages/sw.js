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
        "/pages/fallback.html",
      ]);
      console.log("All shell assets cached");
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("service worker activated", event);
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
      return dynamicallyCache(event.request);
    })
  );
});

async function dynamicallyCache(request) {
  try {
    // If fail to fetch the page/assets (e.g. no network, wrong URL etc.), we can return a Response with a fallback page
    const response = await fetch(request);
    const dynamicCache = await caches.open(DYNAMIC_CACHE_NAME);
    if (request.url.startsWith("http")) {
      console.log(
        `Fetched new assets and stored in ${DYNAMIC_CACHE_NAME}`,
        response
      );
      await dynamicCache.put(request.url, response.clone());
      await limitDynamicCacheSize(3);
    }
    return response;
  } catch (err) {
    // Return a fallback page response from our static cache, if it is an HTML page
    if (request.url.match(/\.html$/)) {
      return caches.match("/pages/fallback.html");
    } else throw err;
  }
}

const limitDynamicCacheSize = async (maxSize) => {
  const dynamicCache = await caches.open(DYNAMIC_CACHE_NAME);
  const keys = await dynamicCache.keys();
  if (keys.length > maxSize) {
    await dynamicCache.delete(keys[0]);
    await limitDynamicCacheSize(maxSize);
  }
};
