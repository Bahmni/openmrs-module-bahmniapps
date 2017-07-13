'use strict';

angular.module("bahmni.ot")
    .directive("onScroll", [function () {
        var link = function ($scope, $element, attrs) {
            $element.bind('scroll', function (evt) {
                // Please dont remove or alter the below class name
                $('.calendar-location').css("top", $element.scrollTop());
                $('.calendar-time-container').css("left", $element.scrollLeft());
            });
        };
        return {
            restrict: "A",
            link: link
        };
    }]);
