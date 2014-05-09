'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('onlyNumber', function () {
        var link = function (scope, element, attrs) {
            var keyCode = [8, 9, 13, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 167, 168, 169, 190];
            element.bind("keydown", function (event) {
                console.log($.inArray(event.which, keyCode));
                if ($.inArray(event.which, keyCode) == -1) {
                    scope.$apply(function () {
                        scope.$eval(attrs.onlyNumber);
                        event.preventDefault();
                    });
                    event.preventDefault();
                }
            });
        };

        return {
            link: link
        }
    });
