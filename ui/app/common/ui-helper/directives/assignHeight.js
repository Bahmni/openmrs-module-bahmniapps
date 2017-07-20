'use strict';

angular.module('bahmni.common.uiHelper').directive('assignHeight', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var height;
            scope.$watch(function () {
                height = element[0].offsetHeight;
                if (attrs.key) {
                    scope[attrs.key] = {
                        height: height
                    };
                }
            });
        }
    };
});
