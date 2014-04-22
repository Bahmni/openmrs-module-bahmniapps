angular.module('bahmni.common.patient')
.filter('age', function() {
	return function(birthDate, referenceDate) {
		var DateUtil = Bahmni.Common.Util.DateUtil;
		referenceDate = referenceDate || DateUtil.now();
		var age = DateUtil.diffInYearsMonthsDays(birthDate, referenceDate);
		if(age.years) return age.years + " y";
		if(age.months) return age.months + " m";
		return age.days + " d";
	};
});