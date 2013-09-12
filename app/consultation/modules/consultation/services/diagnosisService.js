'use strict';

angular.module('opd.consultation.services')
  .factory('DiagnosisService', ['$http', function ($http) {
    var getAllFor = function (searchTerm) {
        var url = "/openmrs/ws/rest/v1/bahmnicore/concept";
          return $http.get(url, {
              method:"GET",
              params:{term:searchTerm}
          });
      };

      return {
          getAllFor:getAllFor
      };
}]);