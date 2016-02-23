'use strict';

angular.module('bahmni.common.offline')
    .factory('offlineConfigInitialization', ['offlineService','$http', 'offlineDbService', 'androidDbService', '$q',
        function (offlineService, $http, offlineDbService, androidDbService, $q) {
            return function () {
                if(offlineService.isOfflineApp()) {
                    if (offlineService.isAndroidApp()) {
                        offlineDbService = androidDbService;
                    }
                    var modules = ['home', 'registration', 'clinical'];
                    angular.forEach(modules, function (appName) {
                        return offlineDbService.getConfig(appName).then(function (result) {
                            var requestUrl = Bahmni.Common.Constants.baseUrl + appName + "/" + appName + ".json";
                            var req = {
                                method: 'GET',
                                url: requestUrl,
                                headers: {
                                    'If-None-Match': result ? result.etag : undefined
                                }
                            };
                            return $http(req).then(function (result) {
                                if (result.status == 200) {
                                    var eTag = result.headers().etag;
                                    return offlineDbService.insertConfig(appName, result.data, eTag);
                                }
                            }).catch(function (result) {
                                return $q.when({});
                            });

                        });
                    })
                }
            };
        }
    ]);
