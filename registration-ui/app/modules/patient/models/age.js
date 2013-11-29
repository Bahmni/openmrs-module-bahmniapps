'use strict';

angular.module('registration.patient.models')
    .factory('age', ['dateUtil', function (dateUtil) {
        var fromBirthDate = function(birthDate) {
            var today = dateUtil.now();
            var period = dateUtil.diffInYearsMonthsDays(birthDate, today)
            return create(period.years, period.months, period.days);
        }

        var create = function(years, months, days) {
            var isEmpty = function() {
                return !(this.years || this.months || this.days);
            }


        	return {
                years: years,
                months: months,
                days: days,
                isEmpty: isEmpty
            };
        }

        return {
            fromBirthDate: fromBirthDate,
            create: create
        }
    }]
 );