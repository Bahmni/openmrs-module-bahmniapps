'use strict';

angular.module('infrastructure.configurationService', [])
    .factory('ConfigurationService', ['$http', '$rootScope', function ($http) {
    var bahmniPatientBaseUrl = "";
    (
        function(){
            var getAll = function(){
                return $http.get(constants.bahmniConfigurationUrl, {
                    method: "GET",
                    withCredentials: true
                });
            }
            getAll().success(function(data){
                bahmniPatientBaseUrl = data.patientImagesUrl;
            })
        }
    )();

    var getImageUrl = function(){
        return bahmniPatientBaseUrl;
    }

    return {
        getImageUrl : getImageUrl
    };
}]);