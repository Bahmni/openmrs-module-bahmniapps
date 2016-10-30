'use strict';

angular.module('bahmni.clinical')
    .directive('buttonsRadio', function () {
        return {
            restrict: 'E',
            scope: { model: '=', options: '=', dirtyCheckFlag: '=' },
            link: function (scope, element, attrs) {
                if (attrs.dirtyCheckFlag) {
                    scope.hasDirtyFlag = true;
                }
            },
            controller: function ($scope) {
                if (!($scope.options instanceof Array)) { // in case a string is passed instead of array
                    $scope.options = $scope.options.split(',');
                }
                $scope.activate = function (option) {
                    if ($scope.model === option) {
                        $scope.model = undefined;
                    } else {
                        $scope.model = option;
                    }
                    if ($scope.hasDirtyFlag) {
                        $scope.dirtyCheckFlag = true;
                    }
                };
            },
            template: "<button type='button' class='btn' " +
                "ng-class='{active: option === model}'" +
                "ng-repeat='option in options' " +
                "ng-click='activate(option)'><span></span>{{option}} " +
                "</button>"
        };
    });
