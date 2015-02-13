'use strict';

angular.module('bahmni.clinical')
    .factory('visitActionsService', ['printer', 'clinicalAppConfigService', function(printer, clinicalAppConfigService) {
        var printConfig = clinicalAppConfigService.getPrintConfig();
        return {
            printPrescription: function (patient, visit, visitDate) {
                printer.print('common/views/prescriptionPrint.html', {visit: visit, patient: patient, visitDate: visitDate});
            }
        };
    }]);
