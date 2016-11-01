'use strict';

angular.module('opd.documentupload')
    .directive('fileUpload', [function () {
        var link = function (scope, element) {
            element.bind("change", function () {
                var file = element[0].files[0];
                var reader = new FileReader();
                reader.onload = function (event) {
                    scope.onSelect()(event.target.result, scope.visit);
                };
                reader.readAsDataURL(file);
            });
        };

        return {
            restrict: 'A',
            scope: {
                'visit': '=',
                'onSelect': '&'
            },
            link: link
        };
    }]);
