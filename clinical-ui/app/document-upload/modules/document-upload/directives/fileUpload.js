angular.module('opd.documentupload')
    .directive('fileUpload', function () {
        return{
            restrict: 'A',
            link: function (scope, element) {
                element.bind("change", function () {
                    var file = element[0].files[0],
                        reader = new FileReader();
                    reader.onload = function (event) {
                        var image = event.target.result;
                        var alreadyPresent = scope.currentVisit.images.filter(function (img) {
                            return img === image;
                        })
                        if (alreadyPresent.length == 0) {
                            scope.currentVisit.images.push(image);
                            scope.$apply();
                        }
                    };
                    reader.readAsDataURL(file);
                });
            }
        }
    });