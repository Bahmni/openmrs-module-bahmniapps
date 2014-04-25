angular.module('bahmni.common.conceptSet')
    .directive('duration', function () {

        var link = function ($scope, element, attrs, ngModelController) {

            var setValue = function () {
                if ($scope.unitValue && $scope.measureValue) {
                    var value = $scope.unitValue * $scope.measureValue;
                    ngModelController.$setViewValue(value);
                } else {
                    ngModelController.$setViewValue(undefined);
                }

            };

            $scope.$watch('measureValue', setValue);
            $scope.$watch('unitValue', setValue);

            $scope.$watch('disabled', function (value) {
                if (value) {
                    $scope.unitValue = undefined;
                    $scope.measureValue = undefined;
                    $scope.hours = undefined;
                }
            });
        };

        var controller = function ($scope) {

            $scope.units = {"Years": 365 * 30 * 24, "Months": 30 * 24, "Days": 24, "Hours": 1};

            for (var unit in $scope.units) {
                var hours = $scope.units[unit];
                if ($scope.hours || $scope.hours !== 0) {
                    if ($scope.hours > hours && $scope.hours % hours === 0) {
                        $scope.unitValue = hours;
                        $scope.measureValue = $scope.hours / hours;
                        break;
                    }
                }
            }
        };

        return {
            restrict: 'E',
            require: 'ngModel',
            controller: controller,
            scope: {
                hours: "=ngModel",
                disabled: "="
            },
            link: link,
            template: '<span>Duration</span><span><input type="number" ng-model=\'measureValue\' ng-disabled="disabled"/></span>' +
                '<span><select ng-model=\'unitValue\' ng-options="name for (name , value) in units" ng-disabled="disabled"><option value=""></option>>' +
                '</select></span>'
        }
    });