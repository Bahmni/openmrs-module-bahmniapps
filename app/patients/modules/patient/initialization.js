'use strict';

angular.module('opd.patient').factory('initialization', ['$rootScope', '$q', 'configurationService',
        function ($rootScope, $q, configurationService) {
            var deferrable = $q.defer();
            var cfgs = configurationService.getConfigurations(['bahmniConfiguration']);
            cfgs.then(function(configurations) {
                $rootScope.bahmniConfiguration = configurations.bahmniConfiguration;
                deferrable.resolve();
            });
            return deferrable.promise;
     }]
);    