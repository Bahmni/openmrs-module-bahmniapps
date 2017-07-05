'use strict';

angular.module('bahmni.appointments')
    .directive('timeValidator', function () {
        var DateUtil = Bahmni.Common.Util.DateUtil;

        var isStartTimeBeforeEndTime = function (serviceDetails) {
            if (!serviceDetails.startTime || !serviceDetails.endTime) {
                return true;
            }
            var timeFormat = 'HH:mm:ss';
            var startTime = DateUtil.getDateTimeInSpecifiedFormat(serviceDetails.startTime, timeFormat);
            var endTime = DateUtil.getDateTimeInSpecifiedFormat(serviceDetails.endTime, timeFormat);
            return (startTime <= endTime);
        };

        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                function validate () {
                    ngModel.$setValidity("timeSequence", isStartTimeBeforeEndTime(scope.service));
                }
                scope.$watch(attrs.ngModel, validate);
                scope.$watch(attrs.dependentModel, validate);
            }
        };
    });

