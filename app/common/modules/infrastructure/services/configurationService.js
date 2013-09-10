'use strict';

angular.module('bahmni.common.infrastructure.services')
    .factory('configurationService', ['$http', '$q', function ($http, $q) {
      
        var configurationFunctions = {};
        configurationFunctions.bahmniConfiguration = function () {
          return $http.get(Bahmni.Common.Constants.bahmniConfigurationUrl, {
              withCredentials: true
          });
        };

        configurationFunctions.encounterConfig = function () {
            return $http.get(Bahmni.Common.Constants.encounterConfigurationUrl, {
                params: {"callerContext": "REGISTRATION_CONCEPTS"},
                withCredentials: true
            });
        };

        configurationFunctions.patientConfig = function () {
            var patientConfig =  $http.get(Bahmni.Common.Constants.patientConfigurationUrl, {
                withCredentials: true
            });


            return patientConfig;
        };


        var getConfigurations = function(configurationNames) {
            var configurations = {};
            var configurationsPromiseDefer = $q.defer();
            var promises = [];

            configurationNames.forEach(function(configurationName){
              promises.push(configurationFunctions[configurationName]().success(function (data) {
                  configurations[configurationName] = data;
                })
              );
            });

            $q.all(promises).then(function () {
                configurationsPromiseDefer.resolve(configurations);
            });

            return configurationsPromiseDefer.promise;
        };

        return {
        getConfigurations: getConfigurations
        };
}]);