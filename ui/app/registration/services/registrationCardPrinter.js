'use strict';

angular.module('bahmni.registration')
    .factory('registrationCardPrinter', ['printer', function (printer) {
        var print = function (templatePath, patient, obs, encounterDateTime) {
            templatePath = templatePath || "views/nolayoutfound.html";
            printer.print(templatePath, {patient: patient, today: new Date(), obs: obs || {}, encounterDateTime: encounterDateTime });
        };

        return {
            print: print
        };
    }]);
