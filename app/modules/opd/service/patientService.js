'use strict';

angular.module('opd.patientService', ['infrastructure.configurationService'])
    .factory('PatientService', ['ConfigurationService', function (configurationService) {

    var constructImageUrl = function (identifier) {
        var imageUrl = configurationService.getImageUrl();
        return imageUrl + "/" + identifier + ".jpeg";
    }

    return{
        constructImageUrl : constructImageUrl
    }
}]);