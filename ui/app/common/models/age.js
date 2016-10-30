'use strict';

angular.module('bahmni.common.models')
    .factory('age', [function () {
        var dateUtil = Bahmni.Common.Util.DateUtil;

        var fromBirthDate = function (birthDate) {
            var today = dateUtil.now();
            var period = dateUtil.diffInYearsMonthsDays(birthDate, today);
            return create(period.years, period.months, period.days);
        };

        var create = function (years, months, days) {
            var isEmpty = function () {
                return !(this.years || this.months || this.days);
            };

            return {
                years: years,
                months: months,
                days: days,
                isEmpty: isEmpty
            };
        };

        var calculateBirthDate = function (age) {
            var birthDate = dateUtil.now();
            birthDate = dateUtil.subtractYears(birthDate, age.years);
            birthDate = dateUtil.subtractMonths(birthDate, age.months);
            birthDate = dateUtil.subtractDays(birthDate, age.days);
            return birthDate;
        };

        return {
            fromBirthDate: fromBirthDate,
            create: create,
            calculateBirthDate: calculateBirthDate
        };
    }]
);
