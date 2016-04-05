'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('singleSubmit', function () {
        var ignoreSubmit = false;
        var link = function (scope, element) {
            element.on('submit', function () {
                if (ignoreSubmit) {
                    return;
                }
                ignoreSubmit = true;
                scope.singleSubmit().finally(function () {
                    ignoreSubmit = false;
                });
            });
        };
        return {
            scope: {
                singleSubmit: '&'
            },
            restrict: 'A',
            link: link
        }
    });