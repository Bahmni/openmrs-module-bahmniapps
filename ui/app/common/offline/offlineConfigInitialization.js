'use strict';

angular.module('bahmni.common.offline')
    .factory('offlineConfigInitialization', ['offlineService','$http',
        function (offlineService, $http) {
            return function (appName) {
                if(offlineService.isAndroidApp()){
                    var requestUrl = Bahmni.Common.Constants.baseUrl + appName + "/concat.json";
                    return $http.get(requestUrl).then(function (result) {
                        return AndroidConfigDbService.insertConfig(appName, JSON.stringify(result.data));
                    });
                }
            };
        }
    ]);
