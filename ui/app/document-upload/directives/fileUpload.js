angular.module('opd.documentupload')
    .directive('fileUpload', ['$rootScope', 'visitDocumentService', 'spinner', function ($rootScope, visitDocumentService, spinner) {

        var link = function (scope, element) {
            element.bind("change", function () {
                var file = element[0].files[0];
                var reader = new FileReader();
                reader.onload = function (event) {
                    var image = event.target.result;
                    spinner.forPromise(visitDocumentService.saveImage(image, $rootScope.patient.uuid, $rootScope.appConfig.encounterType).then(function(response) {
                        var imageUrl = Bahmni.Common.Constants.documentsPath + '/' + response.data;
                        var savedImage = scope.visit.addImage(imageUrl);
                        scope.onSelect()(savedImage, scope.defaultConcept);
                        element.val(null);
                    }));
                };
                reader.readAsDataURL(file);
            });
        };

        return {
            restrict: 'A',
            scope: {
                'visit': '=',
                'onSelect':'&',
                'defaultConcept': '='
            },
            link: link
        }
    }]);
