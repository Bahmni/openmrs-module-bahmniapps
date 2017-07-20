'use strict';

angular.module('bahmni.clinical')
    .controller('LatestPrescriptionPrintController', ['$scope', 'visitActionsService', 'messagingService',
        function ($scope, visitActionsService, messagingService) {
            var print = function (visitStartDate, visitUuid) {
                visitActionsService.printPrescription($scope.patient, visitStartDate, visitUuid);
                messagingService.showMessage("info", "Please close this tab.");
            };

            if ($scope.visitHistory.activeVisit) {
                print($scope.visitHistory.activeVisit.startDatetime, $scope.visitHistory.activeVisit.uuid);
            } else {
                messagingService.showMessage("error", "No Active visit found for this patient.");
            }
        }]);
