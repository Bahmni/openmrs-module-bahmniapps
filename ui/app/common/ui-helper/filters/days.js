angular.module('bahmni.common.uiHelper')
.filter('days', function ($filter) {
    return function(startDate, endDate) {
    	return Bahmni.Common.Util.DateUtil.diffInDays(startDate, endDate);
    }
});