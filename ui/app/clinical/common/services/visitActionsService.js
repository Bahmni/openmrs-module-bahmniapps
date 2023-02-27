'use strict';

angular.module('bahmni.clinical')
    .factory('visitActionsService', ['printer', function (printer) {
        return {
            printPrescription: function (patient, visitDate, visitUuid, printParams) {
                printer.print('common/views/prescriptionPrint.html', {patient: patient, visitDate: visitDate, visitUuid: visitUuid, printParams: printParams});
            }
        };
    }]);
