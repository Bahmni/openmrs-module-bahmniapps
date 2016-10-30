'use strict';

angular.module('bahmni.common.displaycontrol.patientprofile')
    .filter('titleCase', function () {
        return function (input) {
            input = input || '';
            return input.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        };
    });
