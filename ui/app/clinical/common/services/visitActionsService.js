'use strict';

angular.module('bahmni.clinical')
    .factory('visitActionsService', ['printer', 'clinicalAppConfigService', function(printer, clinicalAppConfigService) {
        var printConfig = clinicalAppConfigService.getPrintConfig();
        return {
            printPrescription: function (patient, drugOrders, visitDate) {
                printer.print('common/views/prescriptionPrint.html', {drugOrders: drugOrders, patient: patient, visitDate: visitDate});
            }
        };
    }]);
