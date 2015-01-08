'use strict';

angular.module('bahmni.clinical')
    .controller('LatestPrescriptionPrintController', ['$scope', 'visitActionsService', 'visitInitialization', 'messagingService',
        function ($scope, visitActionsService, visitInitialization, messagingService) {
            var print = function (visit, startDate) {
                visitActionsService.printPrescription($scope.patient, visit, visit.startDate);
                messagingService.showMessage("info", "Please close this tab.");
            };

            if ($scope.visit) {
                print($scope.visit);
            } else if ($scope.visitHistory.visits.length > 0) {
                visitInitialization($scope.patient.uuid, $scope.visitHistory.visits[0].uuid).then(function () {
                    print($scope.visit);
                })
            } else {
                messagingService.showMessage("error", "No Active visit found for this patient.");
            }
        }]);
