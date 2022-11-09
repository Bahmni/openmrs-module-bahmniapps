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
        <ng-transclude></ng-transclude>
        <button type="btn" class="arrow-right" ng-click="scrollRight()" ng-show="showRight"><span class="fa fa-angle-right"></span></button>
      </div>`,
      link: function(scope, element) {
        var scrollContainer = element.find('ul');
        var scrollingWidth;
        
        scope.scrollLeft = function() {
          var scrollPos = Math.min(scrollContainer.position().left + element.outerWidth() / 3, 0);
          scrollPos = Math.abs(scrollPos) < (element.outerWidth() / 15) ? 0 : scrollPos;
          scrollContainer.animate({left: scrollPos + 'px'});
          scope.showLeft = scrollPos < 0;
          scope.showRight = true;
        }
        
        scope.scrollRight = function() {
          scrollingWidth = scrollContainer.outerWidth() - element.outerWidth();
          var scrollPos = Math.min(Math.abs(scrollContainer.position().left - element.outerWidth() / 3), scrollingWidth);
          scrollPos = (scrollingWidth - scrollPos) < (element.outerWidth() / 15) ? scrollingWidth : scrollPos;
          scrollContainer.animate({left: -scrollPos + 'px'});
          scope.showLeft = true;
          scope.showRight = scrollingWidth > scrollPos;
        }

        setTimeout(function() {
          if(scrollContainer.outerWidth() - element.outerWidth() > 0) {
            scope.showRight = true;
          }
        })
      }
  };
})