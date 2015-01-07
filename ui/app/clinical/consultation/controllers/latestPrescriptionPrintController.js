'use strict';

angular.module('bahmni.clinical')
    .controller('LatestPrescriptionPrintController', ['$scope', 'visitActionsService',
        'visitInitialization', 'messagingService', 'patientContext', 'visitContext', 'visitHistory',
        function ($scope, visitActionsService, visitInitialization, messagingService, patientContext, visitContext, visitHistory) {
            var print = function (visit, startDate) {
                visitActionsService.printPrescription(patientContext.patient, visit, visit.startDate);
                messagingService.showMessage("info", "Please close this tab.");
            };

            if (visitContext) {
                print(visitContext);
            } else if (visitHistory.visits.length > 0) {
                visitInitialization(patientContext.patient.uuid, visitHistory.visits[0].uuid).then(function () {
                    print(visitContext);
                })
            } else {
                messagingService.showMessage("error", "No Active visit found for this patient.");
            }
        }]);
