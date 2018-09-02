'use strict';

angular.module('bahmni.common.conceptSet').controller('nepaliDateFieldObservationController', ['$scope', 'conceptSetService', function ($scope, conceptSetService) {
    $scope.npToday = Bahmni.Common.Util.DateUtil.npToday();

    $scope.handleNepaliDateUpdate = function (observation) {
        if (observation.nepaliDate) {
            var date = dateUpdateCommon(observation);
            var month = date.getMonth() + 1;
            if (month < 10) {
                month = '0' + month;
            }
            observation.value = date.getFullYear() + "-" + month + "-" + date.getDate();
        }
    };

    $scope.handleNepaliDateTimeUpdate = function (observation) {
        if (observation.nepaliDate) {
            if (observation.nepaliDate) {
                observation.selectedDate = dateUpdateCommon(observation);
            }
        }
    };

    var dateUpdateCommon = function (observation) {
        if (observation.nepaliDate) {
            var dateStr = observation.nepaliDate.split("-");
            var dateAD = calendarFunctions.getAdDateByBsDate(calendarFunctions.getNumberByNepaliNumber(dateStr[0]), calendarFunctions.getNumberByNepaliNumber(dateStr[1]), calendarFunctions.getNumberByNepaliNumber(dateStr[2]));
            return new Date(dateAD);
        }
    };

    $scope.initializeNepaliDate = function (observation) {
        observation.allowFutureDate = observation.conceptUIConfig && observation.conceptUIConfig.allowFutureDates;
        if (observation.value) {
            var date = observation.value.split("-");
            var bsDate = calendarFunctions.getBsDateByAdDate(parseInt(date[0]), parseInt(date[1]), parseInt(date[2]));
            var obsBsDate = calendarFunctions.bsDateFormat("%y-%m-%d", bsDate.bsYear, bsDate.bsMonth, bsDate.bsDate);
            observation.nepaliDate = obsBsDate;
        }
    };

    $scope.initializeNepaliDateTime = function (observation) {
        observation.allowFutureDate = observation.conceptUIConfig && observation.conceptUIConfig.allowFutureDates;
        if (observation.value) {
            var date = observation.value.split("-");
            var bsDate = calendarFunctions.getBsDateByAdDate(parseInt(date[0]), parseInt(date[1]), parseInt(date[2]));
            var obsBsDate = calendarFunctions.bsDateFormat("%y-%m-%d", bsDate.bsYear, bsDate.bsMonth, bsDate.bsDate);
            observation.nepaliDate = obsBsDate;
            var date = moment(observation.value).toDate();
            observation.selectedTime = date;
            observation.selectedDate = date;
        }
    };

    var valueCompletelyFilled = function (observation) {
        return (observation.selectedDate != null && observation.selectedTime != null);
    };
    var getSelectedDateStr = function (selectedDate) {
        return selectedDate != null ? moment(selectedDate).format("YYYY-MM-DD") : "";
    };
    var getSelectedTimeStr = function (selectedTime) {
        return selectedTime != null ? moment(selectedTime).format("HH:mm") : "";
    };
    var valueNotFilled = function (observation) {
        return observation.value == null && observation.selectedTime == null;
    };

    $scope.isValid = function (observation) {
        return valueNotFilled(observation) || valueCompletelyFilled(observation);
    };

    $scope.updateNepaliDateTime = function (observation) {
        if (valueCompletelyFilled(observation)) {
            observation.value = getSelectedDateStr(observation.selectedDate) + " " + getSelectedTimeStr(observation.selectedTime);
        }
    };
}]);
