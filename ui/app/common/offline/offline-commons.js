var isAStaticResource = function (url) {
    return url.slice(-2) == "js" || url.slice(-3) == "css" || url.slice(-3) == "ttf" || url.slice(-4) == "html"
};

var serviceWorkerInstall = function (event, CACHE) {
    var now = Date.now();
    CACHE.caches.urlsToCache = CACHE.caches.urlsToCache || ['/', '/openmrs'];
    console.log(CACHE.caches.urlsToCache)
    event.waitUntil(
        caches.open(CACHE.name).then(function (cache) {

            var cachePromises = CACHE.caches.urlsToPrefetch.map(function (urlToPrefetch) {

                var url = new URL(urlToPrefetch, location.href);
                url.search += (url.search ? '&' : '?') + 'cache-bust=' + now;
                return fetch(new Request(url, {mode: 'no-cors'})).then(function (response) {
                    if (response.status >= 400) {
                        throw new Error('request for ' + urlToPrefetch +
                            ' failed with status ' + response.statusText);
                    }

                    return cache.put(urlToPrefetch, response);
                }).catch(function (error) {
                    console.error('Not caching ' + urlToPrefetch + ' due to ' + error);
                });
            });

            return Promise.all(cachePromises).then(function () {
                console.log('Pre-fetching complete.');
            });

            console.log(CACHE.caches.urlsToCache)
            return cache.addAll(CACHE.caches.urlsToCache);
        }).catch(function (error) {
            console.error('Pre-fetching failed:', error);
        })
    );
};

var authURL = '/openmrs/ws/rest/v1/session';

var isSuccessfulAuthentication = function (response) {
    console.log(response, response['authenticated'])
    if (response && response['authenticated']) {
        return true;
    }
};

var serviceWorkerFetch = function (event, CACHE) {
    var url = event.request.url;
    event.respondWith(
        caches.match(url)
            .then(function (response) {
                if (response) {
                    return response;
                }
                var fetchRequest = event.request.clone();
                return fetch(fetchRequest).then(
                    function (response) {
                        //if (!response || response.status !== 200 || response.type !== 'basic') {
                        //    return response;
                        //}

                        //var isAuthenticationURL = url.indexOf(authURL) > -1;
                        //if(isAuthenticationURL) {
                        //    return response;
                        //}

                        //if (isAStaticResource(url)) {
                        var responseToCache = response.clone();
                        caches.open(CACHE.name)
                            .then(function (cache) {
                                cache.put(url, responseToCache);
                            });
                        //}
                        return response;
                    }
                );
            })
    );
};

var serviceWorkerActivate = function(event, CURRENT_CACHES) {
    var expectedCacheNames = Object.keys(CURRENT_CACHES.caches).map(function(key) {
        return CURRENT_CACHES.caches[key];
    });

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (expectedCacheNames.indexOf(cacheName) == -1) {
                        console.log('Deleting out of date cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
};

