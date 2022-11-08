"use strict";

angular.module("bahmni.common.patientSearch")
  .directive("scrollableTabs", function () {
    return {
        restrict: "E",
        transclude: true,
        replace: true,
        template:
        `<div class="scrollable-tabs">
          <button type="btn" class="arrow-left" ng-click="scrollLeft()" ng-show="showLeft"><span class="fa fa-angle-left"></span></button>
          <button type="btn" class="arrow-right" ng-click="scrollRight()" ng-show="showRight"><span class="fa fa-angle-right"></span></button>
          <ng-transclude />
        </div>`,
        link: function(scope, element) {
          var scrollContainer = element.find('ul');
          var scrollingWidth;
          
          scope.scrollLeft = function() {
            var scrollPos = scrollContainer.position().left + 100;
            scrollContainer.animate({left: scrollPos + 'px'});
            scope.showLeft = scrollPos < 0;
            scope.showRight = true;
          }
          
          scope.scrollRight = function() {
            var scrollPos = scrollContainer.position().left - 100;
            scrollingWidth = scrollContainer.outerWidth() - element.outerWidth();
            console.log(scrollingWidth);
            scrollContainer.animate({left: scrollPos + 'px'});
            scope.showLeft = true;
            scope.showRight = scrollingWidth > Math.abs(scrollPos);
          }

          setTimeout(function() {
            if(scrollContainer.outerWidth() - element.outerWidth() > 0) {
              scope.showRight = true;
            }
          })
        }
    };
  })