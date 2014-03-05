angular.module('opd.documentupload')
    .directive('fileUpload', function () {

        var link = function (scope, element) {
            element.bind("change", function () {
                var file = element[0].files[0];
                var reader = new FileReader();
                reader.onload = function (event) {
                    var image = event.target.result;
                    scope.visit.addImage(image);
                    scope.$apply();
                    element.val(null);
                };
                reader.readAsDataURL(file);
            });
        };

        return {
            restrict: 'A',
            scope: {
                'visit': '='
            },
            link: link
        }
    });