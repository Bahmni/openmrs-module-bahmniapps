'use strict';

angular.module('bahmni.clinical')
  .service('diagnosisService', ['$http', function ($http) {
    this.getAllFor = function (searchTerm) {
        var url = Bahmni.Common.Constants.emrapiConceptUrl;
        return $http.get(url, {
            method:"GET",
            params:{term:searchTerm, limit:20}
        });
    };

    this.getPastDiagnoses = function (patientUuid) {
        var url = Bahmni.Common.Constants.bahmniDiagnosisUrl;
        return $http.get(url, {
            method:"GET",
            params:{patientUuid:patientUuid}
        });
    };

        // TODO : remove this : shruthi
    this.getRuledOutDiagnoses = function (patientUuid, conceptUuid) {
        var url = Bahmni.Common.Constants.openmrsObsUrl;
        return $http.get(url, {
            method:"GET",
            params:{
                patient:patientUuid,
                concept:conceptUuid,
                v:Bahmni.Common.Constants.openmrsObsRepresentation
            }
        });

    };

}]);