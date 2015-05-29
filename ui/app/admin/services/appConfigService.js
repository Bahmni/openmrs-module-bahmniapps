'use strict';

angular.module('bahmni.admin')
    .service('appConfigService', ['$http', function ($http) {
        this.getAllAppNames = function () {
            return $http.get(Bahmni.Common.Constants.allAppNames,
                {
                    method: "GET",
                    withCredentials: true
                });
        };

        this.makeExtension = function (extn) {
            var name = extn.configName ? extn.configName : extn;
            var url = extn.configName ? extn.appName + "/" + extn.configName : extn;
            return {
                "url": "#/configEditor/" + url,
                "icon": "fa-user",
                "label": name
            };
        };

        this.getAllConfigs = function (appName) {
            return $http.get(Bahmni.Common.Constants.allConfigsForApp,
                {
                    params: {
                        "appName": appName
                    },
                    method: "GET",
                    withCredentials: true
                });
        };

        this.getAppConfig = function (appName, configName) {
            return $http.get(Bahmni.Common.Constants.appConfig,
                {
                    method: "GET",
                    withCredentials: true,
                    params: {
                        appName: appName,
                        configName: configName
                    }
                });
        };

        this.save = function (appConfig) {
            return $http.put(Bahmni.Common.Constants.appConfig,
                appConfig,
                {
                    method: "PUT",
                    withCredentials: true
                }
            );
        }
    }]);
