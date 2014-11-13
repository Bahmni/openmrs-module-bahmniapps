'use strict';

angular.module('bahmni.registration')
    .factory('registrationCardPrinter', ['printer', 'appService', function (printer, appService) {
        var print = function(templatePath, patient, obs) {
            templatePath = templatePath || "views/nolayoutfound.html";
            printer.print(templatePath, {patient: patient, today: new Date(), obs: obs || {}});
        };

        return {
            print: print
        };
    }]);
