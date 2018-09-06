'use strict';

angular.module('bahmni.common.uiHelper')
.filter('days', function () {
    return function (startDate, endDate) {
        return Bahmni.Common.Util.DateUtil.diffInDays(startDate, endDate);
    };
}).filter('bahmniDateTime', function () {
    return function (date) {
        return Bahmni.Common.Util.DateUtil.formatDateWithTime(date);
    };
}).filter('bahmniDate', function () {
    return function (date) {
        return Bahmni.Common.Util.DateUtil.formatDateWithoutTime(date);
    };
}).filter('bahmniTime', function () {
    return function (date) {
        return Bahmni.Common.Util.DateUtil.formatTime(date);
    };
}).filter('bahmniDateInStrictMode', function () {
    return function (date) {
        return Bahmni.Common.Util.DateUtil.formatDateInStrictMode(date);
    };
}).filter('npDate', function () {
    return function (date) {
        if (date !== null && date !== undefined && date !== '' && Bahmni.Common.Util.DateUtil.isValid(date)) {
            date = isNaN(Number(date)) ? date : Number(date);
            var adDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(date).split("-");
            var bsDate = calendarFunctions.getBsDateByAdDate(parseInt(adDate[0]), parseInt(adDate[1]), parseInt(adDate[2]));
            return calendarFunctions.bsDateFormat("%y %M, %d", bsDate.bsYear, bsDate.bsMonth, bsDate.bsDate);
        }
        return date;
    };
}).filter('npDateTime', function () {
    return function (date) {
        if (date !== null && date !== undefined && date !== '' && Bahmni.Common.Util.DateUtil.isValid(date)) {
            date = isNaN(Number(date)) ? date : Number(date);
            var adDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(date).split("-");
            var bsDate = calendarFunctions.getBsDateByAdDate(parseInt(adDate[0]), parseInt(adDate[1]), parseInt(adDate[2]));
            return calendarFunctions.bsDateFormat("%y %M, %d", bsDate.bsYear, bsDate.bsMonth, bsDate.bsDate) + " " + Bahmni.Common.Util.DateUtil.formatTime(date);
        }
        return date;
    };
});
