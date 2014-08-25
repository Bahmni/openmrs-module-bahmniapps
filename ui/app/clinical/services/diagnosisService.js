'use strict';

angular.module('bahmni.clinical')
  .service('diagnosisService', ['$http', function ($http) {
    this.getAllFor = function (searchTerm) {
        var url = Bahmni.Common.Constants.emrapiConceptUrl;
        return $http.get(url, {
            params:{term:searchTerm, limit:20}
        });
    };

    this.getPastDiagnoses = function (patientUuid) {
        var url = Bahmni.Common.Constants.bahmniDiagnosisUrl;
        return $http.get(url, {
            params:{patientUuid:patientUuid}
        });
    };

}]);