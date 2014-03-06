'use strict';

angular.module('opd.consultation')
  .service('DiagnosisService', ['$http', function ($http) {
    this.getAllFor = function (searchTerm) {
        var url = "/openmrs/ws/rest/emrapi/concept";
          return $http.get(url, {
              method:"GET",
              params:{term:searchTerm, limit:20}
          });
      };
}]);