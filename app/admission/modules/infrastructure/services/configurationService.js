'use strict';

angular.module('opd.infrastructure.services')
    .factory('configurationService', ['$http', '$rootScope', function ($http) {
      var getAll = function () {
          return $http.get(Bahmni.Opd.Admission.Constants.bahmniConfigurationUrl, {
              withCredentials: true
          });
      };

      var getEncounterConfig = function () {
          return $http.get(Bahmni.Opd.Admission.Constants.encounterConfigurationUrl, {
              params: {"callerContext": "REGISTRATION_CONCEPTS"},
              withCredentials: true
          });
      };

      return {
          getAll: getAll,
          getEncounterConfig: getEncounterConfig,
      };
}]);