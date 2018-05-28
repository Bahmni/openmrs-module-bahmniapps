'use strict';

angular.module('bahmni.common.domain')
    .service('bedService', ['$http', '$rootScope', function ($http, $rootScope) {
        var mapBedDetails = function (response) {
            var results = response.data.results;
            if (!_.isEmpty(results)) {
                var bed = _.first(results);
                return {
                    'wardName': bed.physicalLocation.parentLocation.display,
                    'wardUuid': bed.physicalLocation.parentLocation.uuid,
                    'physicalLocationName': bed.physicalLocation.name,
                    'bedNumber': bed.bedNumber,
                    'bedId': bed.bedId
                };
            }
        };

        this.setBedDetailsForPatientOnRootScope = function (uuid) {
            var promise = this.getAssignedBedForPatient(uuid);
            promise.then(function (bedDetails) {
                $rootScope.bedDetails = bedDetails;
            });
            return promise;
        };

        this.getAssignedBedForPatient = function (patientUuid, visitUuid) {
            var params = {
                patientUuid: patientUuid,
                v: "full"
            };
            if (visitUuid) {
                params.visitUuid = visitUuid;
                params.s = 'bedDetailsFromVisit';
            }
            return $http.get(Bahmni.Common.Constants.bedFromVisit, {
                method: "GET",
                params: params,
                withCredentials: true
            }).then(mapBedDetails);
        };
        this.assignBed = function (bedId, patientUuid, encounterUuid) {
            var patientJson = {"patientUuid": patientUuid, "encounterUuid": encounterUuid};
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

        this.getCompleteBedDetailsByBedId = function (bedId) {
            return $http.get(Bahmni.Common.Constants.bedFromVisit + "/" + bedId, {
                withCredentials: true
            });
        };
    }]);
