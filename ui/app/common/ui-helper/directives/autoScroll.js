'use strict';

angular.module('bahmni.common.uiHelper').directive('autoScroll', ['$location', '$anchorScroll', '$timeout', function ($location, $anchorScroll, $timeout) {
    var heightOfNavigationBar = 55;
    return {
        scope: {
            autoScrollEnabled: "="
        },
        link: function (scope, element, attrs) {
            $timeout(function () {
                if (scope.autoScrollEnabled) {
                    $('body').animate({
                        scrollTop: $("#" + attrs.autoScroll).offset().top - heightOfNavigationBar
                    }, 500);
                }
            });
            scope.$on('$destroy', function () {
                $timeout.cancel();
                $('body').animate({
                    scrollTop: -1 * heightOfNavigationBar
                }, 0);
            });
        }
    };
}]);
