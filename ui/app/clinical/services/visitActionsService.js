angular.module('bahmni.clinical')
    .factory('visitActionsService', ['printer', function(printer) {
        return {
            printDischargeSummary: function (patient, visit) {
                var dischargeSummary = new Bahmni.Clinical.DischargeSummary(patient, visit);
                printer.print('views/dischargeSummary.html', {dischargeSummary: dischargeSummary, visit: visit, patient: patient});
            },
            printVisitSummary: function (patient, visit, visitDate) {
                var showLabInvestigations = visit.admissionDate ? false: true;
                printer.print('views/visitSummaryPrint.html', {visit: visit, patient: patient, showLabInvestigations: showLabInvestigations, visitDate: visitDate});
            },
            printVisit: function (patient, visit, visitDate) {
                var showLabInvestigations = visit.admissionDate ? false: true;
                printer.print('views/visitPrint.html', {visit: visit, patient: patient, showLabInvestigations: showLabInvestigations, visitDate: visitDate});
            }
        }
    }]);
