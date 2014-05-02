
angular.module('opd.documentupload')
    .directive('dateValidator', function () {
        var DateUtil = Bahmni.Common.Util.DateUtil;

        var isVisitDateFromFuture = function(visitDate){
            if (!visitDate.startDatetime && !visitDate.stopDatetime)
                return false;
            return (DateUtil.getDate(visitDate.startDatetime) > new Date() || (DateUtil.getDate(visitDate.stopDatetime) > new Date()));
        };

        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                function validate() {
                    ngModel.$setValidity("overlap", scope.isNewVisitDateValid());
                    ngModel.$setValidity("future", !isVisitDateFromFuture(scope.newVisit));

                }
                scope.$watch(attrs.ngModel, validate);
                scope.$watch(attrs.dependentModel, validate);
            }
        }
    });