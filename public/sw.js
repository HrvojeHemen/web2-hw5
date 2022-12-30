const filesToCache = [
    "/",
    "manifest.json",
    "index.html",
    "offline.html",
    "error.html"
];
const cacheName = 'MyFancyCacheName_v1';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.delete(cacheName).then(() => {
            caches.open(cacheName).then((cache) => {
                return cache.addAll(filesToCache);
            })
        })
    );

});

self.addEventListener('activate', event => {
    console.log('Service worker installing…');
});


self.addEventListener('fetch', (event) => {
    // console.log("TU SAM")
    // console.log(event.request.url)
    // https://stackoverflow.com/questions/49157622/service-worker-typeerror-when-opening-chrome-extension
    if (event.request.url.startsWith('chrome-extension') || event.request.url.includes('extension')
        || event.request.url.includes('sentry') || !event.request.url.startsWith('http')) return;
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then((response) => {
                    // console.log("response.status = " + response.status);
                    if (response.status === 404) {
                        return caches.match("error.html");
                    }
                    return caches.open(cacheName).then((cache) => {
                        cache.put(event.request.url, response.clone());
                        return response;
                    });
                });
            })
            .catch((error) => {
                // console.log("Error", event.request.url, error);
                return caches.match("offline.html");
            })
    );

});

self.addEventListener("sync", function (event) {
    console.log("Background sync!", event);
    if (event.tag === "sync-snaps") {
        event.waitUntil(runSync());
    }
});

let runSync = async function () {
    entries().then(entries => {
        entries.forEach((entry) => {
            console.log(entry)
        })
    })
}
