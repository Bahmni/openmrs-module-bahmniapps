'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('focusOnInputErrors', function ($timeout) {
        return function (scope, elem) {
            var cleanUpListenerErrorsOnForm = scope.$on("event:errorsOnForm", function () {
                var isTopElement = true;
                $timeout(function() {
                    if($('.concept-set-container').length > 0 ) {
                        var scrollPosition = $('.illegalValue:first').offset().top + $('.illegalValue:first').innerHeight() - $('.concept-set-container').offset().top - $('.concept-set-container').innerHeight()/2;
                        $('.concept-set-container').scrollTop(scrollPosition);
                    }
                    else {
                        var scrollPosition = $('.illegalValue:first').offset().top - window.innerHeight/2;
                        $(window).scrollTop(scrollPosition);
                    }
                }, 10, false);
                if (isTopElement) {
                    $(window).scrollTop(0);
                }
            });

            scope.$on("$destroy", cleanUpListenerErrorsOnForm);
        };
    });
