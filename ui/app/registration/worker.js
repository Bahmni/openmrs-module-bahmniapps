importScripts('../common/offline/serviceworker-cache-polyfill.js');
importScripts('../common/offline/offline-commons.js');

var CACHE_VERSION = 1;
var CACHE = {
    name: "bahmni-registration-cache-v" + CACHE_VERSION,
    caches: {
        urlsToPrefetch: [
            '/openmrs/ws/rest/v1/bahmnicore/sql/globalproperty?property=mrs.genders',
            '/openmrs/ws/rest/v1/bahmnicore/sql/globalproperty?property=bahmni.relationshipTypeMap',
            '/openmrs/ws/rest/v1/bahmnicore/sql/globalproperty?property=concept.reasonForDeath',
            '/bahmni/registration/views/newpatient.html',
            '/bahmni/registration/views/patientcommon.html',
            '/bahmni/registration/views/patientAction.html',
            '/bahmni/common/photo-capture/views/photo.html'
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