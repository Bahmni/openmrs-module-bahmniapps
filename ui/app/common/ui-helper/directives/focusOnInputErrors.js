'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('focusOnInputErrors', ['$timeout', function ($timeout) {
        return function (scope) {
            var cleanUpListenerErrorsOnForm = scope.$on("event:errorsOnForm", function () {
                $timeout(function () {
                    $('.illegalValue:first button').focus();
                    $('.illegalValue:first').focus();
                }, 10, false);
            });

            scope.$on("$destroy", cleanUpListenerErrorsOnForm);
        };
    }]);
