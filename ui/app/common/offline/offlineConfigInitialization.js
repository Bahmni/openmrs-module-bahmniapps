'use strict';

angular.module('bahmni.common.offline')
    .factory('offlineConfigInitialization', ['offlineService','$http', 'offlineDbService', 'androidDbService', '$q','$rootScope',
        function (offlineService, $http, offlineDbService, androidDbService, $q, $rootScope) {
            return function () {
                if(offlineService.isOfflineApp()) {
                    if (offlineService.isAndroidApp()) {
                        offlineDbService = androidDbService;
                    }
                    var modules = ['home', 'registration', 'clinical'];
                    var length = modules.length;
                    var x = 0;
                    var deferred = $q.defer();
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
                                x++;
                                if (result.status == 200) {
                                    var eTag = result.headers().etag;
                                    return offlineDbService.insertConfig(appName, result.data, eTag).then(function(response){
                                        if(response.key == 'home' || response.module == 'home'){
                                            var offlineConfig = response.value['offline-config.json'];
                                            var schedulerInterval = offlineConfig ? offlineConfig.schedulerInterval : 900000;
                                            localStorage.setItem('schedulerInterval', schedulerInterval);
                                        }
                                        if(x ==length) {
                                            deferred.resolve({});
                                        }
                                    });
                                }
                            }).catch(function (response) {
                                if(parseInt(response.status / 100) == 4 || parseInt(response.status / 100) == 5) {
                                    offlineDbService.insertLog(response.config.url, response.status, response.data);
                                    $rootScope.$broadcast("event:restartSync");
                                }
                                x++;
                                if(x ==length) {
                                    deferred.resolve({});
                                }
                            });
                        });
                    });
                    return deferred.promise;
                }
            };
        }
    ]);
