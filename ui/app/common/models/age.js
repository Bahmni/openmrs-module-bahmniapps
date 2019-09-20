'use strict';

angular.module('bahmni.common.models')
    .factory('age', [function () {
        var dateUtil = Bahmni.Common.Util.DateUtil;

        var fromBirthDate = function (birthDate) {
            var today = dateUtil.now();
            birthDate = moment(birthDate, 'DD-MM-YYYY').toDate();
            today = moment(today, 'DD-MM-YYYY').toDate();

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
            if (!age.months) {
                birthDate = dateUtil.subtractYears(birthDate, age.years);
                birthDate = new Date(birthDate.getFullYear(), 5, 15, 0);
                birthDate = moment(birthDate).format('DD-MM-YYYY');
                return birthDate;
            }
            birthDate = dateUtil.subtractYears(birthDate, age.years);
            birthDate = dateUtil.subtractMonths(birthDate, age.months);
            birthDate = dateUtil.subtractDays(birthDate, age.days);
            birthDate = moment(birthDate).format('DD-MM-YYYY');
            return birthDate;
        };

        return {
            fromBirthDate: fromBirthDate,
            create: create,
            calculateBirthDate: calculateBirthDate
        };
    }]
);
