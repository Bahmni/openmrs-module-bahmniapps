angular.module('bahmni.common.patient')
.filter('age', function() {
	return function(birthDate) {
		var DateUtil = Bahmni.Common.Util.DateUtil;
		var age = DateUtil.diffInYearsMonthsDays(birthDate, DateUtil.now());
		if(age.years) return age.years + " y";
		if(age.months) return age.months + " m";
		return age.days + " d";
	};
});