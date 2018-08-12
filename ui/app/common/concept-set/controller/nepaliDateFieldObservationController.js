'use strict';

angular.module('bahmni.common.conceptSet').controller('nepaliDateFieldObservationControler', ['$scope', 'conceptSetService', function ($scope, conceptSetService) {


    $scope.handleNepaliDateUpdate = function(observation){
        console.log(observation);
        console.log("hehehehehehehhehehehe")
        //TODO conversion
        if (observation.nepaliDate) {
            var dateStr = observation.nepaliDate.split("-");
            var dateAD = calendarFunctions.getAdDateByBsDate(calendarFunctions.getNumberByNepaliNumber(dateStr[0]), calendarFunctions.getNumberByNepaliNumber(dateStr[1]), calendarFunctions.getNumberByNepaliNumber(dateStr[2]));
            console.log(dateAD)
            var date = new Date(dateAD);
            var obsAdDate = date.getMonth()+"/"+date.getDay()+"/"+date.getYear()
            console.log(obsAdDate);
            observation.value = obsAdDate;
        }
    };

    var bsToAdConverter = function() {

    }


}]);