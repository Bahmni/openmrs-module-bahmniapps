'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('scrollToElement', function ($timeout) {
        return function (scope, elem, attrs) {
            if (attrs.scrollToElement) {
                $(elem).focus();
                var scrollPosition = $(elem).offset().top - window.innerHeight / 2;
                $(window).scrollTop(scrollPosition);
            }
        };
    });
