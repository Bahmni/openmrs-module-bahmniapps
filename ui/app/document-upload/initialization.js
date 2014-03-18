'use strict';

angular.module('opd.documentupload').factory('initialization',
    ['$rootScope', '$q', '$window', 'configurationService', 'patientService', 'patientMapper', 'authenticator', 'appService',
        function ($rootScope, $q, $window, configurationService, patientService, patientMapper, authenticator, appService) {

            var initializationPromise = $q.defer();
            var url = purl(decodeURIComponent($window.location));
            $rootScope.appConfig = url.param();

            var getConsultationConfigs = function () {
                var configNames = ['encounterConfig'];
                return configurationService.getConfigurations(configNames).then(function (configurations) {
                    $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig);
                });
            };

            var initApp = function() {
                return appService.initApp('document-upload', {'app': false, 'extension' : false});
            };

            authenticator.authenticateUser().then(initApp).then(getConsultationConfigs).then(function () {
                initializationPromise.resolve();
            });

            return initializationPromise.promise;
        }] 
);
