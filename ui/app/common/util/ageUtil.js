'use strict';

Bahmni.Common.Util.AgeUtil = {
    fromBirthDateTillReferenceDate : function (birthDate, referenceDate) {
        var DateUtil = Bahmni.Common.Util.DateUtil;
        var referenceDate = referenceDate || DateUtil.now();
        var period = DateUtil.diffInYearsMonthsDays(birthDate, referenceDate)
        return {years: period.years, months: period.months, days: period.days};
    },

    differenceInMonths: function(date, anotherDate) {
        var age = Bahmni.Common.Util.AgeUtil.fromBirthDateTillReferenceDate(date, anotherDate);
        return parseFloat(((age.years * 12) + age.months + (age.days/30)).toFixed(2));
    }
};