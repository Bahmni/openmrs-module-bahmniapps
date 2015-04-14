'use strict';

Bahmni.Common.Util.AgeUtil = {
    fromBirthDateTillReferenceDate : function (birthDate, referenceDate) {
        var DateUtil = Bahmni.Common.Util.DateUtil;
        var referenceDate = referenceDate || DateUtil.now();
        var period = DateUtil.diffInYearsMonthsDays(birthDate, referenceDate)
        return {years: period.years, months: period.months, days: period.days};
    }
};