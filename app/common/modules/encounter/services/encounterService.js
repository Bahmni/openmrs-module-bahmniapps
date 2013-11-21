'use strict';

angular.module('bahmni.common.encounter.services')
    .service('encounterService', ['$http', function ($http) {

    this.create = function (encounter) {
        return $http.post(Bahmni.Common.Constants.encounterUrl, encounter, {
            withCredentials:true
        });
    };

}]);