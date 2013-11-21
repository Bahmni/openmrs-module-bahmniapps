'use strict';
// TODO : remove this. use encounterService
angular.module('opd.consultation.services')
    .factory('consultationService', ['$http', function ($http) {
    var create = function (encounter) {
        return $http.post(Bahmni.Common.Constants.encounterUrl, encounter, {
            withCredentials: true
        });
    };

    return {
        create: create
    };

}]);