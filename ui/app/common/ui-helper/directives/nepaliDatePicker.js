'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('npdatepicker', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function ($scope, element, attrs, ngModelCtrl) {
                $timeout(function () {
                    if (attrs.allowFutureDates) {
                        attrs.max = "";
                    }
                    element.nepaliDatePicker({
                        dateFormat: "%y-%m-%d",
                        closeOnDateSelect: true,
                        minDate: attrs.min !== '' && attrs.min !== 'undefined' ? attrs.min : null,
                        maxDate: attrs.max !== '' && attrs.max !== 'undefined' ? attrs.max : null
                    });
                }, 400);
                element.on('dateSelect', function (event) {
                    element.trigger('input');
                });
            }
        };
    }]);
