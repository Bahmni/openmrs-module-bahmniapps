'use strict';

angular.module('bahmni.common.uiHelper')
.filter('days', function () {
    return function(startDate, endDate) {
    	return Bahmni.Common.Util.DateUtil.diffInDays(startDate, endDate);
    }
}).filter('bahmniDate', function() {
    return function (longDate) {
        return Bahmni.Common.Util.DateUtil.parseLongDatetime(longDate);
    }
});