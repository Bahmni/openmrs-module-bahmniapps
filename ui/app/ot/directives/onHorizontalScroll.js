'use strict';

angular.module("bahmni.ot")
    .directive("onHorizontalScroll", [function () {
        var link = function (scope, element, attrs) {
            var divTag = document.getElementsByClassName(attrs.onHorizontalScroll)[0];
            element.on('scroll', function () {
                divTag.scrollLeft = element[0].scrollLeft;
            });
        };
        return {
            restrict: "A",
            link: link
        };
    }]);
