'use strict';

angular.module('opd.admission').factory('initialization', ['$rootScope', '$q', 'configurationService',
        function ($rootScope, $q, configurationService) {
            var deferrable = $q.defer();
            var foo = configurationService.getConfigurations(['bahmniConfiguration', 'encounterConfig']);
            foo.then(function(configurations) {
                $rootScope.bahmniConfiguration = configurations.bahmniConfiguration;
                $rootScope.encounterConfig = configurations.encounterConfig;
                deferrable.resolve();
            });
            return deferrable.promise;
     }]
);    