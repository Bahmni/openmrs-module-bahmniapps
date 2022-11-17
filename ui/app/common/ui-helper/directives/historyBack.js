'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('historyBack', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.click(function () {
                    history.back();
                    scope.$apply();
                });
            }
        };
    });
