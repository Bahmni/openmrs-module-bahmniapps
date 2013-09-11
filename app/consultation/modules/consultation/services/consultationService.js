'use strict';

angular.module('opd.consultation.services')
    .factory('consultationService', ['$http', '$rootScope', function ($http, $rootScope) {
    
    var create = function (encounter) {
        return $http.post(Bahmni.Common.Constants.encounterUrl, encounter, {
            withCredentials: true
        });
    };

    return {
        create: create
    };

}]);