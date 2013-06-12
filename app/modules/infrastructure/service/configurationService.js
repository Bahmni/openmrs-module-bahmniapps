'use strict';

angular.module('infrastructure.configurationService', [])
    .factory('ConfigurationService', ['$http', '$rootScope', function ($http) {

    var bahmniPatientBaseUrl = "";

    var getAll = function () {
        return $http.get(constants.bahmniConfigurationUrl, {
            method:"GET",
            withCredentials:true
        });
    }

    var init = function () {
        getAll().success(function (data) {
            bahmniPatientBaseUrl = data.patientImagesUrl;
        })
    }

    var getImageUrl = function () {
        return bahmniPatientBaseUrl;
    }

    return {
        init:init,
        getImageUrl:getImageUrl
    };
}]);