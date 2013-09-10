'use strict';

angular.module('opd.admission').factory('initialization', ['$rootScope', '$q', 'configurationService',
        function ($rootScope, $q, configurationService) {
            var deferrable = $q.defer();
            var cfgs = configurationService.getConfigurations(['bahmniConfiguration', 'encounterConfig','patientConfig']);
            cfgs.then(function(configurations) {

                $rootScope.bahmniConfiguration = configurations.bahmniConfiguration;
                $rootScope.encounterConfig = configurations.encounterConfig;
                $rootScope.patientConfig = configurations.patientConfig;
                deferrable.resolve();
            });
            return deferrable.promise;
     }]
);    