'use strict';

angular.module('bahmni.common.offline')
    .factory('offlineConfigInitialization', ['offlineService', '$http', 'offlineDbService', 'androidDbService', '$q', '$rootScope', 'loggingService',
        function (offlineService, $http, offlineDbService, androidDbService, $q, $rootScope, loggingService) {
            return function () {
                if (offlineService.isOfflineApp()) {
                    if (offlineService.isAndroidApp()) {
                        offlineDbService = androidDbService;
                    }
                    var modules = ['home', 'registration', 'clinical', "dbNameCondition"];
                    var length = modules.length;
                    var deferred = $q.defer();

                    var readConfigData = function (modules, index) {
                        if (length == index) {
                            deferred.resolve(1);
                            return deferred.promise;
                        }
                        var appName = modules[index];
                        return offlineDbService.getConfig(appName).then(function (result) {
                            var requestUrl = Bahmni.Common.Constants.baseUrl + appName + "/" + appName + ".json";
                            var req = {
                                method: 'GET',
                                url: requestUrl,
                                headers: {
                                    'If-None-Match': result ? result.etag : undefined
                                }
                            };
                            return req;
                        }).then(function (req) {
                            return $http(req).then(function (result) {
                                if (result.status == 200) {
                                    var eTag = result.headers().etag;
                                    return offlineDbService.insertConfig(appName, result.data, eTag).then(function (response) {
                                        if (response.key == 'home' || response.module == 'home') {
                                            var offlineConfig = response.value['offline-config.json'];
                                            var schedulerInterval = offlineConfig ? offlineConfig.schedulerInterval : 900000;
                                            localStorage.setItem('schedulerInterval', schedulerInterval);
                                        }
                                        return readConfigData(modules, ++index);
                                    });
                                }
                            }).catch(function (response) {
                                if (parseInt(response.status / 100) == 4 || parseInt(response.status / 100) == 5) {
                                    loggingService.logSyncError(response.config.url, response.status, response.data);
                                    return readConfigData(modules, ++index);
                                } else if (response.status == -1) {
                                    $rootScope.$broadcast("schedulerStage", null, true);
                                    deferred.reject(response);
                                } else {
                                    return readConfigData(modules, ++index);
                                }
                                return deferred.promise;
                            });
                        });
                    };
                    return readConfigData(modules, 0);
                }
            };
        }
    ]);
