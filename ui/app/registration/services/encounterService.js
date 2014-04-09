'use strict';

angular.module('bahmni.registration')
    .factory('encounterService', ['$http', '$rootScope', function ($http, $rootScope) {
    
    var create = function (encounter) {

        encounter.providers = encounter.providers || [];
        if ($rootScope.currentProvider && $rootScope.currentProvider.uuid) {
            encounter.providers.push( { "uuid" : $rootScope.currentProvider.uuid } );
        }

        return $http.post(Bahmni.Registration.Constants.emrApiRESTBaseURL + '/encounter', encounter, {
            withCredentials: true
        });
    };

    var getActiveEncounter =  function (patientUuid, visitTypeUuid, encounterTypeUuid, providerUuid) {
        var url = Bahmni.Registration.Constants.emrApiRESTBaseURL + "/encounter/active";
        return $http.get(url, {
            params: {"patientUuid": patientUuid, "visitTypeUuid" : visitTypeUuid, "encounterTypeUuid" : encounterTypeUuid, providerUuid: providerUuid, "includeAll" : false},
            withCredentials: true
        });
    }

    return {
        create: create,
        getActiveEncounter : getActiveEncounter
    };
}]);