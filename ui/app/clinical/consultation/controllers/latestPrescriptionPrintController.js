'use strict';

angular.module('bahmni.clinical')
    .controller('LatestPrescriptionPrintController', ['$scope', 'visitActionsService', 'messagingService',
        function ($scope, visitActionsService, messagingService) {
            var print = function (visitStartDate, visitUuid) {
                visitActionsService.printPrescription($scope.patient, visitStartDate, visitUuid, null);
                messagingService.showMessage("info", "CLOSE_TAB_MESSAGE");
            };

            if ($scope.visitHistory.activeVisit) {
                print($scope.visitHistory.activeVisit.startDatetime, $scope.visitHistory.activeVisit.uuid);
            } else {
                messagingService.showMessage("error", "NO_ACTIVE_VISIT_FOUND_MESSAGE");
            }
        }]);
