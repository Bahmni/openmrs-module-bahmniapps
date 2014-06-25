angular.module('bahmni.clinical')
    .factory('visitActionsService', ['printer', function(printer) {
        return {
            printDischargeSummary: function (patient, visit) {
                var dischargeSummary = new Bahmni.Clinical.DischargeSummary(patient, visit);
                printer.print('views/dischargeSummaryPrint.html', {dischargeSummary: dischargeSummary, visit: visit, patient: patient});
            },
            printOpdSummary: function (patient, visit, visitDate) {
                var showLabInvestigations = visit.admissionDate ? false: true;
                printer.print('views/opdSummaryPrint.html', {visit: visit, patient: patient, showLabInvestigations: showLabInvestigations, visitDate: visitDate, print: true});
            },
            printVisitSummary: function (patient, visit, visitDate) {
                var showLabInvestigations = visit.admissionDate ? false: true;
                printer.print('views/visitSummaryPrint.html', {visit: visit, patient: patient, showLabInvestigations: showLabInvestigations, visitDate: visitDate});
            }
        }
    }]);
