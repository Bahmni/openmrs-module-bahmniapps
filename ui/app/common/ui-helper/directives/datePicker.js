angular.module('bahmni.common.uiHelper')
    .directive('datepicker', function ($parse) {
        var link = function ($scope, element, attrs, ngModel) {
            $(function(){
                var today = new Date();
                element.datepicker({
                    changeYear: true,
                    changeMonth: true,
                    maxDate: today,
                    dateFormat: 'dd/mm/yy',
                    onSelect: function (dateText) {
                        $scope.$apply(function (scope) {
                            ngModel.$setViewValue(dateText);
                        });
                    }
                });
            })
        }
        return {
            restrict: 'A',
            require: 'ngModel',
            link: link
        }
    });