angular.module('opd.documentupload')
    .directive('dateValidator', function () {

        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                function validate(value) {
                    var visitDateValid = scope.isVisitDateValid(scope.newVisit);
                    ngModel.$setValidity("overlap", visitDateValid);

                }
                scope.$watch(attrs.ngModel, validate);
                scope.$watch(attrs.dependentModel, validate);
            }
        }
    });