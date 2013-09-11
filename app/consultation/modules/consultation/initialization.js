'use strict';

angular.module('opd.consultation').factory('initialization', ['$rootScope', '$q', 'configurationService',
        function ($rootScope, $q, configurationService) {
            var deferrable = $q.defer();
            var cfgs = configurationService.getConfigurations(['bahmniConfiguration', 'encounterConfig']);
            cfgs.then(function(configurations) {
                $rootScope.bahmniConfiguration = configurations.bahmniConfiguration;
                $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig); 
                deferrable.resolve();
            });
            return deferrable.promise;
     }]
);    