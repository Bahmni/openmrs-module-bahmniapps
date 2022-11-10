"use strict";

angular.module("bahmni.common.patientSearch")
    .directive("scrollableTabs", ['$timeout', function ($timeout) {
        return {
            restrict: "E",
            transclude: true,
            replace: true,
            template:
                '<div class="scrollable-tabs">' +
                    '<button type="btn" class="arrow-left" ng-click="scrollLeft()" ng-show="showLeft">' +
                    '<span class="fa fa-angle-left"></span>' +
                    '</button>' +
                    '<ng-transclude></ng-transclude>' +
                    '<button type="btn" class="arrow-right" ng-click="scrollRight()" ng-show="showRight">' +
                    '<span class="fa fa-angle-right"></span>' +
                    '</button>' +
                '</div>',
            link: function (scope, element) {
                var scrollContainer = element.find('ul');
                var scrollingWidth = 0;

                scope.scrollLeft = function () {
                    var scrollPos = Math.min(scrollContainer.position().left + element.outerWidth() / 3, 0);
                    scrollPos = Math.abs(scrollPos) < (element.outerWidth() / 15) ? 0 : scrollPos;
                    scrollContainer.animate({ left: scrollPos + 'px' });
                    scope.showLeft = scrollPos < 0;
                    scope.showRight = true;
                };

                scope.scrollRight = function () {
                    scrollingWidth = scrollContainer.outerWidth() - element.outerWidth();
                    var scrollPos = Math.min(Math.abs(scrollContainer.position().left - element.outerWidth() / 3), scrollingWidth);
                    scrollPos = (scrollingWidth - scrollPos) < (element.outerWidth() / 15) ? scrollingWidth : scrollPos;
                    scrollContainer.animate({ left: -scrollPos + 'px' });
                    scope.showLeft = true;
                    scope.showRight = scrollingWidth > scrollPos;
                };

                $timeout(function () {
                    if (scrollContainer.outerWidth() - element.outerWidth() > 0) {
                        scope.showRight = true;
                    }
                });

                Bahmni.Common.Util.SwipeUtil.detectSwipe(function (evt, direction) {
                    if ($(evt.target).closest('.scrollable-tabs').length) {
                        if (direction === Bahmni.Common.Util.SwipeUtil.DIRECTIONS.RIGHT) {
                            scope.scrollRight();
                        }

                        if (direction === Bahmni.Common.Util.SwipeUtil.DIRECTIONS.LEFT) {
                            scope.scrollLeft();
                        }
                    }
                    scope.$apply();
                });

                angular.element(window).resize(function () {
                    $timeout(function () {
                        scrollingWidth = scrollContainer.outerWidth() - element.outerWidth();
                        scope.showRight = scrollingWidth > 0 && Math.abs(scrollContainer.position().left) < scrollingWidth;
                        scope.showLeft = scrollingWidth > 0 && scrollContainer.position().left < 0;
                        if (!scope.showRight && !scope.showLeft) {
                            scrollContainer.css({"left": 0});
                        }
                    });
                });
            }
        };
    }]);
