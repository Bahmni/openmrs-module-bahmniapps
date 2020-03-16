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
    }).filter('bahmniDateTimeWithFormat', function () {
        return function (date, format) {
            return Bahmni.Common.Util.DateUtil.getDateTimeInSpecifiedFormat(date, format);
        };
    }).filter('addDays', function () {
        return function (date, numberOfDays) {
            return Bahmni.Common.Util.DateUtil.addDays(date, numberOfDays);
        };
    });
