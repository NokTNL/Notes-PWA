- Service worker JS file only has the scope of folder it is located in. Therefore, it is usually put in the root directory.
  - You can check thhe `scope` property in the `ServiceWorkerRegistration` object
- Again, the service worker has to be registered in EVERY HTML page we have (via `/js/app.js`)
- Service worker only works for secure HTTPS connections. One exception is the `localhost`, to make development easier.

## Make built-in install banner appear in Android Chrome during development

- When the app is deemed as installable in Chrome, it will prompt you to install the app
  - This won't appear in Safari, but PWA also only works in Safari on iOS --> the install banner will never appear in iOS
- However, when using live-server in Android simulator, it uses the address `10.0.2.2:5500`, which is neither HTTPS or localhost
- You can use 'Port forwarding' in Chrome to change the IP address.
  - Go to `chrome://inspect` in Chrome, choose 'port forwarding'
  - Type port = `5500` and IP address + port `localhost:5500`, then tick `Enable port forwarding`
  - Now you can use `localhost:5500` to access the app, and the banner will show up
