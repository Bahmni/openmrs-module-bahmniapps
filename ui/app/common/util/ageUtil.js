'use strict';

Bahmni.Common.Util.AgeUtil = (function () {
    var differenceInMonths = function (date, anotherDate) {
        var age = fromBirthDateTillReferenceDate(date, anotherDate);
        return parseFloat(((age.years * 12) + age.months + (age.days / 30)).toFixed(3));
    };

    var fromBirthDateTillReferenceDate = function (birthDate, referenceDate) {
        var DateUtil = Bahmni.Common.Util.DateUtil;
        referenceDate = referenceDate || DateUtil.now();
        var period = DateUtil.diffInYearsMonthsDays(birthDate, referenceDate);
        return {years: period.years, months: period.months, days: period.days};
    };

    var monthsToAgeString = function (months) {
        var age = monthsToAge(months);
        var ageString = '';
        if (age.years) {
            ageString += age.years + 'y ';
        }
        if (age.months) {
            ageString += age.months + 'm ';
        }
        if (age.days) {
            ageString += age.days + 'd';
        }
        return ageString;
    };

    var monthsToAge = function (months) {
        var years = Math.floor(months / 12);
        var remainingMonths = Math.floor(months % 12);
        var days = Math.round((months - Math.floor(months)) * 30);
        return {years: years, months: remainingMonths, days: days};
    };

    return {
        monthsToAgeString: monthsToAgeString,
        differenceInMonths: differenceInMonths
    };
})();
