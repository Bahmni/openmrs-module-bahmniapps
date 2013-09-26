'use strict';

angular.module('opd.bedManagement.services', [])
    .factory('WardsListService', ['$http', function ($http) {

    var getWardsList = function (uuid) {
        return $http.get("/openmrs/ws/rest/v1/admissionLocation");
    }

    return {
        getWardsList: getWardsList
    };
}]);