'use strict';

angular.module('opd.patient.services')
  .factory('PatientService', ['ConfigurationService', function (configurationService) {
    var constructImageUrl = function (identifier) {
        var imageUrl = configurationService.getImageUrl();
        return imageUrl + "/" + identifier + ".jpeg";
    }

    return{
        constructImageUrl : constructImageUrl
    }
}]);