'use strict';

angular.module('opd.bedManagement')
    .service('BedService', ['$http', '$rootScope', function ($http, $rootScope) {

        this.getBedDetailsForPatient = function (uuid) {
            return $http.get("/openmrs/ws/rest/v1/beds", {
                method: "GET",
                params: {patientUuid: uuid, v: "full"},
                withCredentials: true
            }).success(function (response) {
                if (response.results.length > 0) {
                    var bed = response.results[0];
                    $rootScope.bedDetails = {
                       'wardName': bed.physicalLocation.parentLocation.display,
                       'wardUuid': bed.physicalLocation.parentLocation.uuid,
                       'physicalLocationName' : bed.physicalLocation.name,
                       'bedNumber' : bed.bedNumber,
                       'bedId' : bed.bedId
                    };
                }
            });
        };

        this.freeBed = function (bedId) {
            return $http.delete("/openmrs/ws/rest/v1/beds/" + bedId, {}, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

        this.assignBed = function (bedId, patientUuid, encounterUuid) {
            var patientJson = {"patientUuid": patientUuid, "encounterUuid" : encounterUuid};
            return $http.post("/openmrs/ws/rest/v1/beds/" + bedId, patientJson, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

        this.getBedInfo = function (bedId) {
            return $http.get("/openmrs/ws/rest/v1/beds/" + bedId + "?v=custom:(bedId,bedNumber,patient:(uuid,person:(age,personName:(givenName,familyName),gender),identifiers:(uuid,identifier),),physicalLocation:(name))", {
                withCredentials: true
            });
        };
    }]);
