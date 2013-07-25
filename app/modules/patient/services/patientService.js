'use strict';

angular.module('opd.patient.services')
  .factory('PatientService', ['$rootScope', function ($rootScope) {
    var constructImageUrl = function (identifier) {
        return $rootScope.bahmniConfiguration.patientImagesUrl + "/" + identifier + ".jpeg";
    }

    return{
        constructImageUrl : constructImageUrl
    }
}]);