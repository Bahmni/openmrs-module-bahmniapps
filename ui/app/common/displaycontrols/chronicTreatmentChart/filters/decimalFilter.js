'use strict';

angular.module('bahmni.common.displaycontrol.chronicTreatmentChart')
    .filter('decimalFilter', function () {
        return function (value) {
            if (!isNaN(value) && value !== '') {
                value = +(value);
                return Math.floor(value);
            }
            return value;
        };
    });
