'use strict';

angular.module('bahmni.appointments')
    .directive('colorPicker', ['$document', function ($document) {
        return {
            restrict: "E",
            scope: {
                colors: "=",
                selectedColor: '='
            },
            templateUrl: "../appointments/views/admin/colorPicker.html",
            link: function (scope) {
                scope.showTheColorPicker = function (event) {
                    scope.showColorPicker = !scope.showColorPicker;
                    event.stopPropagation();
                };

                scope.setColor = function (color, event) {
                    scope.selectedColor = color;
                    scope.showColorPicker = false;
                    event.stopPropagation();
                };

                $document.bind("click", function (ev) {
                    scope.showColorPicker = false;
                    scope.$digest();
                });
            }
        };
    }]);
