angular.module('bahmni.common.uiHelper')
    .directive('splitButton', function ($parse) {
        var controller = function($scope) {
            $scope.primaryOption = $scope.primaryOption || $scope.options[0];
            $scope.secondaryOptions = _.without($scope.options, $scope.primaryOption);

            $scope.hasMultipleOptions = function() {
                return $scope.secondaryOptions.length > 0;
            }
        }

        return {
            restrict: 'A',
            template: '<div class="split-button" bm-pop-over>'+
                        '<ul class="options">' +
                            '<li class="primaryOption">' +
                                '<button ng-class="buttonClass" ng-click="optionClick()(primaryOption)">{{optionText()(primaryOption)}}</a>' +
                            '</li>' +
                            '<li bm-pop-over-target ng-repeat="option in secondaryOptions" class="secondaryOption">' +
                                '<button ng-class="buttonClass" ng-click="optionClick()(option)">{{optionText()(option)}}</a>' +
                            '</li>' +
                        '</ul>' +
                        '<button bm-pop-over-trigger class="toggle-button icon-caret-down" ng-show="hasMultipleOptions()" type="button"></button>' +
                      '</div>',
            controller: controller,
            scope: {
                options: '=',
                primaryOption: '=',
                optionText: '&',
                optionClick: '&'
            }
        };
    });