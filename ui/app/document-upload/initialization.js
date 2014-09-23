'use strict';

angular.module('opd.documentupload').factory('initialization',
    ['$rootScope', '$q', '$window', '$location', 'configurationService', 'authenticator', 'appService','spinner',
        function ($rootScope, $q, $window, $location, configurationService, authenticator, appService, spinner) {

            var initializationPromise = $q.defer();
            var url = purl(decodeURIComponent($window.location));
            $rootScope.appConfig = url.param();


            var getConsultationConfigs = function () {
                var configNames = ['encounterConfig'];
                return configurationService.getConfigurations(configNames).then(function (configurations) {
                    $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig);
                });
            };

            var validate = function() {
                var deferrable = $q.defer();
                var throwValidationError = function(errorMessage) {
                    $rootScope.error = errorMessage;
                    initializationPromise.reject();
                    deferrable.reject();
                };

                if($rootScope.appConfig.encounterType == null) {
                    throwValidationError("encounterType should be configured in config");
                } else if($rootScope.encounterConfig.getEncounterTypeUuid($rootScope.appConfig.encounterType) == null) {
                    throwValidationError("Configured encounterType does not exist");
                }

                deferrable.resolve();
                return deferrable;
            };

            var initApp = function() {
                return appService.initApp('documentUpload', {'app': true, 'extension' : true}, $rootScope.appConfig.encounterType);
            };

            $rootScope.$on("$stateChangeError", function() {
                $location.path("/error");
            });

            authenticator.authenticateUser().then(initApp).then(getConsultationConfigs).then(validate).then(function () {
                initializationPromise.resolve();
            });


            return spinner.forPromise(initializationPromise.promise);
        }] 
);
