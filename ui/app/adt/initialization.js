'use strict';

angular.module('bahmni.adt').factory('initialization', ['$rootScope', '$q', 'appService', 'configurations', 'authenticator', 'spinner',
    function ($rootScope, $q, appService, configurations, authenticator, spinner) {
        var getConfigs = function () {
            var config = $q.defer();
            var configNames = ['encounterConfig', 'patientConfig', 'genderMap', 'relationshipTypeMap'];
            configurations.load(configNames).then(function () {
                $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig());
                $rootScope.patientConfig = configurations.patientConfig();
                $rootScope.genderMap = configurations.genderMap();
                $rootScope.relationshipTypeMap = configurations.relationshipTypeMap();
                config.resolve();
            });
            return config.promise;
        };

        var initApp = function () {
            return appService.initApp('adt', {'app': true, 'extension': true}).then(function(data){
                var config = data.getConfig("onAdmissionForwardTo", false);
                data.baseConfigs.isBedManagementEnabled = {name: 'isBedManagementEnabled', value: _.contains(config[0].value, 'bed')};
                if(config[1]){
                    data.customConfigs.isBedManagementEnabled={name: 'isBedManagementEnabled', value: _.contains(config[1].value, 'bed')};
                }
            });
        };

        return spinner.forPromise(authenticator.authenticateUser().then(initApp).then(getConfigs));
    }
]);