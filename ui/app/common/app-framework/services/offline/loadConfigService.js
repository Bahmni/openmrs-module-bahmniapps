'use strict';

angular.module('bahmni.common.appFramework')
    .service('loadConfigService', ['$http', '$q', 'offlineService', 'androidDbService', 'offlineDbService',
        function ($http, $q, offlineService, androidDbService, offlineDbService) {
        this.loadConfig = function (url, contextPath) {
            if(offlineService.isOfflineApp()) {
                var configFile = url.substring(url.lastIndexOf("/") + 1);
                if(offlineService.isAndroidApp()) {
                    offlineDbService = androidDbService;
                }
                return offlineDbService.getConfig(contextPath).then(function(config){
                    return {"data": config.value[configFile]};
                });
            }
            return $http.get(url, {withCredentials: true});
        };

    }]);