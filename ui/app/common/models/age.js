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
            var date = dateUtil.now();
            if (age.years) {
                date.setFullYear(date.getFullYear() - age.years);
            }
            if (age.months) {
                date.setMonth(date.getMonth() - age.months);
            }
            if (age.days) {
                date.setDate(date.getDate() - age.days);
            }
            return date;
        };

        return {
            fromBirthDate: fromBirthDate,
            create: create,
            calculateBirthDate: calculateBirthDate
        };
    }]
);
