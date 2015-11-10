importScripts('../common/offline/serviceworker-cache-polyfill.js');
importScripts('../common/offline/offline-commons.js');

var CACHE_VERSION = 1;
var CACHE = {
    name: "bahmni-home-cache-v" + CACHE_VERSION,
    caches: {
        urlsToPrefetch: [
            '/bahmni/styles/home.css',
            '/bahmni_config/openmrs/apps/home/extension.json',
            '/bahmni_config/openmrs/apps/home/app.json',
            '/openmrs/ws/rest/v1/bahmnicore/sql/globalproperty?property=mrs.genders',
            '/bahmni_config/openmrs/i18n/home/locale_en.json'
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
