'use strict';

angular.module('bahmni.registration')
    .factory('registrationCardPrinter', ['printer', 'appService', function (printer, appService) {
        var print = function (patient) {
            var templatePath = appService.getAppDescriptor().getConfigValue("registrationCardPrintLayout") || "views/nolayoutfound.html";
            printer.print(templatePath, {patient: patient});
        };

        var printSupplementalPaper = function(patient, obs) {
            var templatePath = appService.getAppDescriptor().getConfigValue("supplementalPaperPrintLayout") || "views/nolayoutfound.html";
            printer.print(templatePath, {patient: patient, today: new Date(), obs: obs || {}});
        }
        return {
            print: print,
            printSupplementalPaper: printSupplementalPaper
        };
    }]);
