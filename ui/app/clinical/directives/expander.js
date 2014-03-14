angular.module('bahmni.clinical')
.directive('expander',function(){
    return {
        restrict: 'EA',
        replace: true,
        transclude: true,
        template : '<div>' +
        '<div class="title icon-double-angle-down" ng-click="toggle()"></div>' +
        '<div class="body" ng-show="showMe" ng-transclude></div>' +
        '</div>',
        link: function(scope,element,attrs) {
            scope.showMe = false;
            scope.toggle = function toggle(){
                scope.showMe = !scope.showMe;
            }
        }
    }
});