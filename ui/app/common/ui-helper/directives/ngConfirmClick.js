'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('ngConfirmClick', function () {
        return {
            link: function (scope, element, attr) {
                var msg = attr.confirmMessage || "Are you sure?";
                var clickAction = attr.ngConfirmClick;
                element.bind('click', function () {
                    if (window.confirm(msg)) {
                        scope.$apply(clickAction);
                    }
                });
            }
        };
    });