'use strict';

angular.module('opd.patientsListService', ['infrastructure.configurationService'])
    .factory('PatientsListService', ['$http', 'ConfigurationService', function ($http, configurationService) {

    var constructImageUrl = function (identifier) {
        var imageBaseUrl = "";
        configurationService.getAll().success(function (data) {
            imageBaseUrl = data.patientImagesUrl
        })
        return imageBaseUrl + "/" + identifier + ".jpeg"
    }
}]);