'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('focusOnInputErrors', function () {
        return function (scope) {
            var cleanUpListenerErrorsOnForm = scope.$on("event:errorsOnForm", function () {
                $('.illegalValue:first button').focus();
                $('.illegalValue:first').focus();
            });

            scope.$on("$destroy", cleanUpListenerErrorsOnForm);
        };
    });
