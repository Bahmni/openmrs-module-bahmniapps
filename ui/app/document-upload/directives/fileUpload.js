'use strict';

angular.module('opd.documentupload')
    .directive('fileUpload', [function () {
        var link = function (scope, element) {
            element.bind("change", function () {
                var files = element[0].files;
                angular.forEach(files, function (file, index) {
                    var reader = new FileReader();
                    reader.onload = function (event) {
                        scope.onSelect()(event.target.result, scope.visit, file.name, file.type);
                    };
                    reader.readAsDataURL(file);
                });
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
