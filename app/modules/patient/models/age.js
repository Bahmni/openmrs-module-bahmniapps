'use strict';

angular.module('resources.age', ['resources.date'])
    .factory('age', ['date', function (date) {
        var fromBirthDate = function(birthDate) {
            var today = date.now();
            var period = date.diffInYearsMonthsDays(birthDate, today)
            return create(period.years, period.months, period.days);
        }

        var create = function(years, months, days) {
            var isEmpty = function() {
                //It is important for angular dirty tracking to access all properties before we use conditional opertaor.
                var yrs = this.years;
                var mons = this.months;
                var ds = this.days;
                return !(yrs || mons || ds);
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