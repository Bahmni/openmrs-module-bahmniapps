(function (global) {
    'use strict';

    var configs = [
            '/bahmni_config/openmrs/apps/customDisplayControl/js/customControl.js',
            '/bahmni_config/openmrs/apps/home/app.json',
            '/bahmni_config/openmrs/apps/home/extension.json',
            '/bahmni_config/openmrs/i18n/home/locale_en.json',
            '/bahmni_config/openmrs/apps/registration/app.json',
            '/bahmni_config/openmrs/apps/registration/extension.json',
            '/bahmni_config/openmrs/i18n/registration/locale_en.json',
            '/bahmni_config/openmrs/apps/registration/fieldValidation.js'
        ],
        styles = [
            '/bahmni/styles/fonts/opensans-regular-webfont.ttf',
            '/bahmni/styles/fonts/fontawesome-webfont.woff2?v=4.3.0',
            '/bahmni/styles/fonts/opensans-bold-webfont.ttf',
            '/bahmni/styles/home.css',
            '/bahmni/styles/registration.css'
        ],
        modules = [
            '/',
            '/home',
            '/bahmni/home',
            '/bahmni/registration/'
        ],
        rest = [
            '/openmrs/ws/rest/v1/location?q=Login+Location&s=byTags&v=default',
            '/openmrs/ws/rest/v1/bahmnicore/config/bahmniencounter?callerContext=REGISTRATION_CONCEPTS',
            '/openmrs/ws/rest/v1/personattributetype?v=custom:(uuid,name,sortWeight,description,format,concept)',
            '/openmrs/ws/rest/v1/idgen/identifiersources',
            '/openmrs/module/addresshierarchy/ajax/getOrderedAddressHierarchyLevels.form',
            '/openmrs/ws/rest/v1/relationshiptype?v=custom:(aIsToB,bIsToA,uuid)'
        ],
        preFetchCompleteList = styles.concat(
                configs.concat(
                    modules.concat(rest)));

    importScripts('./components/sw-toolbox/sw-toolbox.js');

    //configuration
    global.toolbox.router.default = global.toolbox.networkFirst;
    global.toolbox.options.debug = false;
    global.toolbox.options.cache = {
        name: 'bahmni-home-cache-v-1',
        maxAgeSeconds: null,
        maxEntries: null
    };
    //this should be before any https calls
    global.toolbox.precache(preFetchCompleteList);

    //listeners for life cycle
    global.addEventListener('install', function () {
        console.log('Service worker installed.');
    });
    global.addEventListener('activate', function () {
        console.log('Service worker activated.');
    });

    //routing
    global.toolbox.router.get('/openmrs/(.*)', global.toolbox.networkFirst);
    global.toolbox.router.get('/bahmni_config/(.*)', global.toolbox.networkOnly);
    global.toolbox.router.get('/openmrs/ws/rest/v1/session?v=custom:(uuid)', global.toolbox.networkOnly);
    global.toolbox.router.get('/event-log-service/(.*)', global.toolbox.networkOnly);
    global.toolbox.router.get('/(.*)', global.toolbox.networkFirst);

    //update caches
    var updateCache = function (items) {
        for (var i in items) {
            global.toolbox.uncache(items[i]);
            global.toolbox.cache(items[i]);
        }
    };
    updateCache(configs);
    //updateCache(globalProperty);
    //updateCache(rest);
    //updateCache(preFetchList);
    //updateCache(others);

})(self);
