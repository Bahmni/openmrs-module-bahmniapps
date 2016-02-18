'use strict';

angular.module('bahmni.common.offline')
    .factory('offlineConfigInitialization', ['offlineService','$http', 'offlineDbService', 'androidDbService', '$q',
        function (offlineService, $http, offlineDbService, androidDbService, $q) {
            return function (appName) {
                if(offlineService.isOfflineApp()) {
                    var requestUrl = Bahmni.Common.Constants.baseUrl + appName + "/" + appName + ".json";
                    if (offlineService.isAndroidApp()) {
                        offlineDbService = androidDbService;
                    }
                    return offlineDbService.getConfig(appName).then(function(result){
                        var req = {
                            method: 'GET',
                            url: requestUrl,
                            headers: {
                                'If-None-Match': result ? result.etag : undefined
                            }
                        };
                        return $http(req).then(function (result) {
                            if(result.status == 200) {
                                var eTag = result.headers().etag;
                                return offlineDbService.insertConfig(appName, result.data, eTag);
                            }
                        }).catch(function(result){
                            if(result.status == 304) {
                                return $q.when({});
                            }
                        });

                    });
                }
            };
        }
    ]);
