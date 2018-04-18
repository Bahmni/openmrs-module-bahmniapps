'use strict';

angular.module('bahmni.ipd').factory('bedInitialization', ['$rootScope', '$q', 'patientService', 'initialization', 'bedService', 'spinner',
    function ($rootScope, $q, patientService, initialization, bedService, spinner) {
        return function (bedId, patientUuid) {
            var initializeBedInfo = function () {
                if (bedId) {
                    return bedService.getCompleteBedDetailsByBedId(bedId).then(function (response) {
                        var bedInfo = response.data;
                        bedInfo.wardName = response.data.physicalLocation.parentLocation.display;
                        bedInfo.wardUuid = response.data.physicalLocation.parentLocation.uuid;
                        bedInfo.physicalLocationName = response.data.physicalLocation.name;
                        $rootScope.bedDetails = bedInfo;
                        return bedInfo;
                    });
                }
                return bedService.setBedDetailsForPatientOnRootScope(patientUuid);
            };
            return spinner.forPromise(initializeBedInfo());
        };
    }
]);

