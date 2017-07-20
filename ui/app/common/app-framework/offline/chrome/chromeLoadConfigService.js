'use strict';

angular.module('bahmni.common.appFramework')
    .service('loadConfigService', ['offlineDbService',
        function (offlineDbService) {
            this.loadConfig = function (url, contextPath) {
                var configFile = url.substring(url.lastIndexOf("/") + 1);
                return offlineDbService.getConfig(contextPath).then(function (config) {
                    if (config) {
                        return {"data": config.value[configFile]};
                    }
                    return {"data": {}};
                });
            };
        }]);
