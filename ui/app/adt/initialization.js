'use strict';

angular.module('bahmni.adt').factory('initialization', ['$rootScope', '$q', 'appService', 'configurations', 'authenticator', 'spinner',
    function($rootScope, $q, appService, configurations, authenticator, spinner) {
        var getConfigs = function() {
            var configNames = ['encounterConfig', 'patientConfig'];
            return configurations.load(configNames).then(function() {
                $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig());
                $rootScope.patientConfig = configurations.patientConfig();
            });
        };

        var initApp = function() {
            return appService.initApp('adt', {'app': true, 'extension' : true });
        };

        return spinner.forPromise(authenticator.authenticateUser().then(initApp).then(getConfigs));
    }
]);