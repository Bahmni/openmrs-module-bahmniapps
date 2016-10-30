'use strict';

angular.module('bahmni.common.conceptSet')
    .factory('conceptSetUiConfigService', ['$http', '$q', 'appService', function ($http, $q, appService) {
        var setConceptUuidInsteadOfName = function (config, conceptNameField, uuidField) {
            var conceptName = config[conceptNameField];
            if (conceptName != null) {
                return $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl, {
                    params: {name: conceptName, v: "custom:(uuid,name)"}
                }).then(function (response) {
                    var concept = response.data.results.filter(function (c) {
                        return c.name.name === conceptName;
                    });
                    if (concept.length > 0) {
                        config[uuidField] = concept[0].uuid;
                    }
                });
            }
        };

        var setExtraData = function (config) {
            Object.getOwnPropertyNames(config).forEach(function (conceptConfigKey) {
                var conceptConfig = config[conceptConfigKey];
                if (conceptConfig['freeTextAutocomplete'] instanceof Object) {
                    setConceptUuidInsteadOfName(conceptConfig['freeTextAutocomplete'], 'codedConceptName', 'codedConceptUuid');
                    setConceptUuidInsteadOfName(conceptConfig['freeTextAutocomplete'], 'conceptSetName', 'conceptSetUuid');
                }
            });
        };

        var getConfig = function () {
            var config = appService.getAppDescriptor().getConfigValue("conceptSetUI") || {};
            setExtraData(config);
            return config;
        };

        return {
            getConfig: getConfig
        };
    }]);
