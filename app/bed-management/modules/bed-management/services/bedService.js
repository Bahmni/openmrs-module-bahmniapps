'use strict';

angular.module('opd.bedManagement.services')
    .service('BedService', ['$http', '$rootScope', function ($http, $rootScope) {

        this.getBedDetailsForPatient = function (uuid) {
            return $http.get("/openmrs/ws/rest/v1/beds", {
                method: "GET",
                params: {patientUuid: uuid, v: "full"},
                withCredentials: true
            }).success(function (response) {
                    if (response.results.length > 0) {
                        $rootScope.bedDetails = {};
                        $rootScope.bedDetails.wardName = response.results[0].physicalLocation.parentLocation.display;
                        $rootScope.bedDetails.wardUuid = response.results[0].physicalLocation.parentLocation.uuid;
                        $rootScope.bedDetails.physicalLocationName = response.results[0].physicalLocation.name;
                        $rootScope.bedDetails.bedNumber = response.results[0].bedNumber;
                        $rootScope.bedDetails.bedId = response.results[0].bedId;
                    }
                });
        };

        this.freeBed = function (bedId) {
            return $http.delete("/openmrs/ws/rest/v1/beds/" + bedId, {}, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

        this.assignBed = function (bedId, patientUuid) {
            var patientJson = {"patientUuid": patientUuid};
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
