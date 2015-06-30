'use strict';

angular.module('bahmni.clinical')
    .factory('visitActionsService', ['printer', function (printer) {
        return {
            printPrescription: function (patient, visitDate, visitUuid) {
                printer.print('common/views/prescriptionPrint.html', {patient: patient, visitDate: visitDate, visitUuid: visitUuid});
            }
        };
    }]);
