'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('ngConfirmClick', function () {
        var link = function (scope, element, attr) {
            var msg = attr.confirmMessage || "Are you sure?";
            var clickAction = attr.ngConfirmClick;
            element.bind('click', function () {
                if(attr.ngCondition) {
                    var condition = scope.$eval(attr.ngCondition)
                    if (!condition) {
                        var conditionMsg = scope.$eval(attr.conditionMessage)
                        return window.confirm(conditionMsg);
                    }
                }
                if (window.confirm(msg)) {
                    scope.$apply(clickAction);
                }
            });
        }
        return {
            restrict: 'A',
            link:link
        };
    });
