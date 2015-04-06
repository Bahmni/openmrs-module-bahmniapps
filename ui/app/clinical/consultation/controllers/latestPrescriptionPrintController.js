'use strict';

angular.module('bahmni.clinical')
    .controller('LatestPrescriptionPrintController', ['$scope', 'visitActionsService', 'visitInitialization', 'messagingService',
        function ($scope, visitActionsService, visitInitialization, messagingService) {
            var print = function (visit) {
                visitActionsService.printPrescription($scope.patient, visit, visit.startDate);
                messagingService.showMessage("info", "Please close this tab.");
            };

            if ($scope.visitHistory.activeVisit) {
                visitInitialization($scope.visitHistory.activeVisit.uuid).then(function (visit) {
                    $scope.visit = visit;
                    print($scope.visit);
                });
            } else {
                messagingService.showMessage("error", "No Active visit found for this patient.");
            }
        }]);