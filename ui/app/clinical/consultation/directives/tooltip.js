"use strict";

angular.module("bahmni.clinical").directive("tooltip", ['$timeout', function ($timeout) {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            var tooltip = angular.element('<div class="tooltip">');
            tooltip.text(attrs.tooltip);

            tooltip.css({
                position: "absolute",
                top: element.offset().top + element.height(),
                left: element.offset().left + element.width() / 2 - 70
            });

            tooltip.hide();

            element.on("mouseover", function () {
                var isTextTruncated = element[0].scrollWidth > element[0].clientWidth;

                var isStillOnElement = true;
                var timeoutId = $timeout(function () {
                    if (isStillOnElement && isTextTruncated) {
                        tooltip.show();
                    }
                }, 1000);
                element.on("mouseout", function () {
                    isStillOnElement = false;
                    clearTimeout(timeoutId);
                    tooltip.hide();
                });
            });

            angular.element(document.body).append(tooltip);

            element.on("$destroy", function () {
                tooltip.remove();
            });
        }
    };
}]);
