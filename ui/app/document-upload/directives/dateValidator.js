'use strict';

angular.module('opd.documentupload')
    .directive('dateValidator', function () {
        var DateUtil = Bahmni.Common.Util.DateUtil;

        var isVisitDateFromFuture = function (visitDate) {
            if (!visitDate.startDatetime && !visitDate.stopDatetime) {
                return false;
            }
            return (DateUtil.getDate(visitDate.startDatetime) > new Date() || (DateUtil.getDate(visitDate.stopDatetime) > new Date()));
        };

        var isStartDateBeforeEndDate = function (visitDate) {
            if (!visitDate.startDatetime || !visitDate.stopDatetime) {
                return true;
            }
            return (DateUtil.getDate(visitDate.startDatetime) <= DateUtil.getDate(visitDate.stopDatetime));
        };

        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                function validate () {
                    ngModel.$setValidity("overlap", scope.isNewVisitDateValid());
                    ngModel.$setValidity("future", !isVisitDateFromFuture(scope.newVisit));
                    ngModel.$setValidity("dateSequence", isStartDateBeforeEndDate(scope.newVisit));
                }
                scope.$watch(attrs.ngModel, validate);
                scope.$watch(attrs.dependentModel, validate);
            }
        };
    });
