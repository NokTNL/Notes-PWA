// Register the service worker
// This will be run on EVERY reload of the page
// - You need to check if service worker is supported in the browser
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    // `then` callback recieves a `ServiceWorkerRegistration` object
    .then((reg) => {
      console.log("service worker registered", reg);
    })
    .catch((err) => {
      console.log("service worker not registered!", err);
    });
}
