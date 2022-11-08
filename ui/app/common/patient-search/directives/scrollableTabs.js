"use strict";

angular.module("bahmni.common.patientSearch")
  .directive("scrollableTabs", function () {
    return {
        restrict: "E",
        transclude: true,
        replace: true,
        template:
        `<div class="scrollable-tabs">
          <button type="btn" class="arrow-left" ng-click="scrollLeft()"><span class="fa fa-angle-left"></span></button>
          <button type="btn" class="arrow-right" ng-click="scrollRight()"><span class="fa fa-angle-right"></span></button>
          <ng-transclude />
        </div>`,
        link: function(scope, element) {
          var scrollContainer = element.find('ul');
          
          scope.scrollLeft = function() {
            scrollContainer.animate({left: scrollContainer.position().left + 100 + 'px'});
          }
          
          scope.scrollRight = function() {
            scrollContainer.animate({left: scrollContainer.position().left - 100 + 'px'});
          }
        }
    };
  })