'use strict';

angular.module('bahmni.registration')
    .directive('patternValidate', function () {
        var link = function(scope, element, attrs) {
            var elementData = scope.attribute;
            if(elementData.pattern) {
                element.attr("pattern", elementData.pattern);
                element.attr("title", elementData.patternErrorMessage);
                element.attr("type", "text");
            }
        };
        return {
            restrict: 'A',
            link: link
        }
    });