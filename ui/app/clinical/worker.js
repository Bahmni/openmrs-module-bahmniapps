importScripts('../common/offline/serviceworker-cache-polyfill.js');
importScripts('../common/offline/offline-commons.js');

var CACHE_VERSION = 1;
var CACHE = {
    name: "bahmni-clinical-cache-v" + CACHE_VERSION,
    caches: {
        urlsToPrefetch: [
        ],
        urlsToCache: [
            '/',
            '/openmrs',
            '/bahmni/lib/'
        ]
    }
};

self.addEventListener('install', (function (cache) {
    return function (e) {
        serviceWorkerInstall(e, cache)
    };
})(CACHE));

self.addEventListener('fetch', (function (cache) {
    return function (e) {
        serviceWorkerFetch(e, cache)
    };
})(CACHE));