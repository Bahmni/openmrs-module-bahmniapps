angular.module('bahmni.clinical')
    .factory('visitActionsService', ['printer', function(printer) {
        return {
            printDischargeSummary: function (patient, visit) {
                var dischargeSummary = new Bahmni.Clinical.DischargeSummary(patient, visit);
                printer.print('common/views/dischargeSummaryPrint.html', {dischargeSummary: dischargeSummary, visit: visit, patient: patient});
            },
            printOpdSummary: function (patient, visit, visitDate) {
                var showLabInvestigations = visit.admissionDate ? false: true;
                printer.print('common/views/opdSummaryPrint.html', {visit: visit, patient: patient, showLabInvestigations: showLabInvestigations, visitDate: visitDate, print: true});
            },
            printVisitSummary: function (patient, visit, visitDate) {
                var showLabInvestigations = visit.admissionDate ? false: true;
                printer.print('common/views/visitSummaryPrint.html', {visit: visit, patient: patient, showLabInvestigations: showLabInvestigations, visitDate: visitDate});
            },
            printPrescription: function (patient, visit, visitDate) {
                printer.print('common/views/prescriptionPrint.html', {visit: visit, patient: patient, visitDate: visitDate});
            }
        }
    }]);
