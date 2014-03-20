'use strict';

angular.module('bahmni.clinical')
  .service('DiagnosisService', ['$http', function ($http) {
    this.getAllFor = function (searchTerm) {
        var url = Bahmni.Common.Constants.emrapiConceptUrl;
          return $http.get(url, {
              method:"GET",
              params:{term:searchTerm, limit:20}
          });
      };

     this.getPastDiagnoses = function(patientUuid){
         var url = Bahmni.Common.Constants.emrapiDiagnosisUrl;
         return $http.get(url, {
             method:"GET",
             params:{patientUuid:patientUuid}
         });
     }
}]);