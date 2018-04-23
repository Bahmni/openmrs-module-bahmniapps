'use strict';

angular.module('bahmni.ot')
    .directive('stringToNumber', function () {
        return {
            require: 'ngModel',
            link: function (scope, elem, attrs, ngModel) {
                if (attrs.type === 'number') {
                    ngModel.$formatters.push(function (value) {
                        return parseFloat(value);
                    });
                }
            }
        };
    });
