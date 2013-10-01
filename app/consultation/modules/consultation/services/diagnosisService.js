'use strict';

angular.module('opd.consultation.services')
  .factory('DiagnosisService', ['$http', function ($http) {
    var getAllFor = function (searchTerm) {
        var url = "/openmrs/ws/rest/emrapi/concept";
          return $http.get(url, {
              method:"GET",
              params:{term:searchTerm, limit:20}
          });
      };

      return {
          getAllFor:getAllFor
      };
}]);