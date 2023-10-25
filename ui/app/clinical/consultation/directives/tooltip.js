"use strict";

angular.module("bahmni.clinical").directive("tooltip", ['$timeout', function ($timeout) {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            var tooltip = angular.element('<div class="tooltip">');
            tooltip.text(attrs.tooltip);

            // Tooltip element element positioning absolutely next to the element that the directive is applied to.
            tooltip.css({
                position: "absolute",
                top: element.offset().top + element.height(),
                left: element.offset().left + element.width() / 2 - 70
            });

            tooltip.hide();

            element.on("mouseover", function () {
                var isTextTruncated = element[0].scrollWidth > element[0].clientWidth;

                $timeout(function () {
                    if (isTextTruncated) {
                        tooltip.show();
                    }
                }, 1500);
            });

            element.on("mouseout", function () {
                tooltip.hide();
            });

            angular.element(document.body).append(tooltip);

            element.on("$destroy", function () {
                tooltip.remove();
            });
        }
    };
}]);
