'use strict';

angular.module('bahmni.common.domain')
    .service('bedService', ['$q', '$http', '$rootScope', function ($q, $http, $rootScope) {

        var mapBedDetails = function(response) {
            if (response.results.length > 0) {
                var bed = response.results[0];
                return {
                   'wardName': bed.physicalLocation.parentLocation.display,
                   'wardUuid': bed.physicalLocation.parentLocation.uuid,
                   'physicalLocationName' : bed.physicalLocation.name,
                   'bedNumber' : bed.bedNumber,
                   'bedId' : bed.bedId
                };
            }
        }

        this.setBedDetailsForPatientOnRootScope = function (uuid) {
            var promise = this.getAssignedBedForPatient(uuid);
            promise.then(function (bedDetails) {
                $rootScope.bedDetails = bedDetails;
            });
            return promise;
        };

        this.getAssignedBedForPatient = function(patientUuid) {
            var deffered = $q.defer();
            $http.get(Bahmni.Common.Constants.bedFromVisit, {
                method: "GET",
                params: {patientUuid: patientUuid, v: "full"},
                withCredentials: true
            }).success(function (response) {
                deffered.resolve(mapBedDetails(response));
            });
            return deffered.promise;
        };

        this.freeBed = function (bedId, patientUuid) {
            return $http.delete(Bahmni.Common.Constants.bedFromVisit + "/" + bedId, {params:{patientUuid: patientUuid}}, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

        this.assignBed = function (bedId, patientUuid, encounterUuid) {
            var patientJson = {"patientUuid": patientUuid, "encounterUuid" : encounterUuid};
            return $http.post(Bahmni.Common.Constants.bedFromVisit + "/" + bedId, patientJson, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

        this.getBedInfo = function (bedId) {
            return $http.get(Bahmni.Common.Constants.bedFromVisit + "/" + bedId + "?v=custom:(bedId,bedNumber,patients:(uuid,person:(age,personName:(givenName,familyName),gender),identifiers:(uuid,identifier),),physicalLocation:(name))", {
                withCredentials: true
            });
        };
    }]);
