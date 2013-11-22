'use strict';

angular.module('opd.bedManagement.services')
    .factory('BedService', ['$http', function ($http) {

    var bedDetailsForPatient = function (uuid) {
        return $http.get("/openmrs/ws/rest/v1/beds", {
            method:"GET",
            params:{patientUuid:uuid, v:"full"},
            withCredentials:true
        });
    }

    var getBedInfo = function (bedId) {
        return $http.get("/openmrs/ws/rest/v1/beds/" + bedId + "?v=custom:(bedId,bedNumber,patient:(uuid,person:(age,personName:(givenName,familyName),gender),identifiers:(uuid,identifier),),physicalLocation:(name))", {
            withCredentials:true
        });
    }


    return {
        getBedInfo:getBedInfo,
        bedDetailsForPatient:bedDetailsForPatient
    };
}]);
