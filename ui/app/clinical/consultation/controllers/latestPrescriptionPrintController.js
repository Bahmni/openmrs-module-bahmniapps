'use strict';

angular.module('bahmni.clinical')
    .controller('LatestPrescriptionPrintController', ['$scope', '$rootScope', 'visitActionsService',
        'visitInitialization', 'messagingService', 'patientContext',
        function ($scope, $rootScope, visitActionsService, visitInitialization, messagingService, patientContext) {
            var print = function (visit, startDate) {
                visitActionsService.printPrescription(patientContext.patient, visit, visit.startDate);
                messagingService.showMessage("info", "Please close this tab.");
            };

            if ($rootScope.visit) {
                print($rootScope.visit);
            } else if ($rootScope.visits.length > 0) {
                visitInitialization(patientContext.patient.uuid, $rootScope.visits[0].uuid).then(function () {
                    print($rootScope.visit);
                })
            } else {
                messagingService.showMessage("error", "No Active visit found for this patient.");
            }
        }]);
