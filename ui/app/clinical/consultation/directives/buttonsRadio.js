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
                if (angular.isString($scope.options)) {
                    $scope.options = $scope.options.split(',').reduce(function (options, item) {
                        options[item] = item;
                        return options;
                    }, {});
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
                "ng-class='{active: value === model}'" +
                "ng-repeat='(displayOption,value) in options' " +
                "ng-click='activate(value)'><span></span>{{displayOption | translate}} " +
                "</button>"
        };
    });
