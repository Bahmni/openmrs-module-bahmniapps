angular.module('bahmni.clinical')
    .factory('visitActionsService', ['printer', 'clinicalAppConfigService', function(printer, clinicalAppConfigService) {
        var printConfig = clinicalAppConfigService.getPrintConfig();
        return {
            printDischargeSummary: function (patient, visit) {
                var dischargeSummary = new Bahmni.Clinical.DischargeSummary(patient, visit);
                printer.print('common/views/dischargeSummaryPrint.html', {dischargeSummary: dischargeSummary, visit: visit, patient: patient});
            },
            printOpdSummary: function (patient, visit, visitDate) {
                var opdSummaryPrintConfig = printConfig["opdSummaryPrint"] || {};
                opdSummaryPrintConfig.visitUuids = [visit.uuid];
                printer.print('common/views/opdSummaryPrint.html', {visit: visit, patient: patient, visitDate: visitDate, print: true, investigationResultsParameters: opdSummaryPrintConfig});
            },
            printVisitSummary: function (patient, visit, visitDate) {
                var visitSummaryPrintConfig = printConfig["visitSummaryPrint"] || {};
                visitSummaryPrintConfig.visitUuids = [visit.uuid];
                printer.print('common/views/visitSummaryPrint.html', {visit: visit, patient: patient, visitDate: visitDate, investigationResultsParameters: visitSummaryPrintConfig});
            },
            printPrescription: function (patient, visit, visitDate) {
                printer.print('common/views/prescriptionPrint.html', {visit: visit, patient: patient, visitDate: visitDate});
            }
        }
    }]);
