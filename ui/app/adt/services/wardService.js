'use strict';

angular.module('bahmni.adt')
    .service('wardService', ['$http', function ($http) {
        this.bedsForWard = function (uuid) {
            return $http.get(Bahmni.ADT.Constants.admissionLocationUrl + uuid, {
                method: "GET",
                params: {v: "full"},
                withCredentials: true
            });
        };

        this.getWardsList = function () {
            return $http.get(Bahmni.ADT.Constants.admissionLocationUrl);
        };
    }]);
