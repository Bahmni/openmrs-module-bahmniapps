'use strict';

angular.module('bahmni.registration')
.factory('registrationCardPrinter', ['printer', function(printer){
    var print = function(patient) {
        printer.print('views/print.html', {patient: patient});
    }
    return {print: print};
}]);
