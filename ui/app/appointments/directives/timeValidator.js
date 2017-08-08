'use strict';

angular.module('bahmni.appointments')
    .directive('timeValidator', function () {
        var DateUtil = Bahmni.Common.Util.DateUtil;

        var isStartTimeBeforeEndTime = function (model) {
            if (!model.startTime || !model.endTime) {
                return true;
            }
            var timeFormat = 'THH:mm:ss';
            var startTime = DateUtil.getDateTimeInSpecifiedFormat(model.startTime, timeFormat);
            var endTime = DateUtil.getDateTimeInSpecifiedFormat(model.endTime, timeFormat);
            return (startTime < endTime);
        };

        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                function validate () {
                    ctrl.$setValidity("timeSequence", isStartTimeBeforeEndTime(ctrl.$viewValue));
                }
                scope.$watch(attrs.ngModel + '.startTime', validate);
                scope.$watch(attrs.ngModel + '.endTime', validate);
            }
        };
    });

