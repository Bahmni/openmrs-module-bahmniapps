'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('singleClick', function () {
        var ignoreClick = false;
        var link = function (scope, element) {
            element.on('click', function () {
                if (ignoreClick) {
                    return;
                }
                ignoreClick = true;
                scope.singleClick().finally(function () {
                    ignoreClick = false;
                });
            });
        };
        return {
            scope: {
                singleClick: '&'
            },
            restrict: 'A',
            link: link
        }
    });