'use strict';

angular.module('bahmni.common.uiHelper')
.filter('days', function () {
    return function(startDate, endDate) {
    	return Bahmni.Common.Util.DateUtil.diffInDays(startDate, endDate);
    }
});