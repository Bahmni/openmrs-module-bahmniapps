angular.module('bahmni.common.uiHelper')
    .directive('imageObservationGallery', ['ngDialog', function (ngDialog) {

        var controller = function ($scope) {
            $scope.photos = [];
            $scope.imageIndex = 0;

            this.image = function (record) {
                return {
                    src: Bahmni.Common.Constants.documentsPath + '/' + record.imageObservation.value,
                    title: record.concept.name,
                    desc: record.imageObservation.comment,
                    date: record.imageObservation.observationDateTime,
                    uuid: record.imageObservation.uuid
                };
            };

            this.addImage = function (record) {
                $scope.photos.push(this.image(record));
            };

            this.setIndex = function (record) {
                $scope.imageIndex = _.findIndex($scope.photos, function (photo) {
                    return record.imageObservation.uuid === photo.uuid;
                })
            };

            this.open = function () {
                ngDialog.open({
                    template: 'views/imageObservationGallery.html',
                    className: undefined,
                    scope: $scope
                })
            };
        };

        return {
            controller: controller,
            scope: {
                imageIndex: "=?",
                patient: "=",
                title: "="
            }
        }
    }])
    .directive('imageObservation', function () {

        var link = function ($scope, element, attrs, imageGalleryController) {
            var mapImageObservation = function (observation) {
                return {concept: observation.concept, imageObservation: observation };
            };
            var imageObservation = mapImageObservation($scope.observation);

            imageGalleryController.addImage(imageObservation);
            element.click(function (e) {
                e.stopPropagation();
                imageGalleryController.setIndex(imageObservation);
                imageGalleryController.open();
            });
        };

        return {
            link: link,
            observation: '=',
            require: '^imageObservationGallery'
        };
    })
    .directive('imageObservationObservation', function () {
        var link = function (scope, element, attrs, imageGalleryController) {
            imageGalleryController.addImage(scope.observation);
            element.click(function (e) {
                e.stopPropagation();
                imageGalleryController.setIndex(scope.observation);
                imageGalleryController.open();
            });
        };
        return {
            link: link,
            scope: {
                observation: '='
            },
            require: '^imageObservationGallery'
        };
    })
    .directive("imageObservationList", function () {
        var link = function (scope, elem, attrs, imageGalleryController) {
            console.log("ldoiwefiweufuweoifuowieufoiuewoifoiweo");
            console.log(scope);
            $(elem).click(function () {
                angular.forEach(scope.list, function (record) {
                    console.log("eeeeks");
                    imageGalleryController.addImage(record);
                });
                imageGalleryController.open();
            });
        };
        return {
            link: link,
            scope: {
                list: "="
            },
            require: '^imageObservationGallery'
        }
    })
    .directive("lazyImageList", ['$rootScope', 'encounterService', function ($rootScope, encounterService) {
        var link = function (scope, elem, attrs, imageGalleryController) {
            $(elem).click(function () {
                var encounterTypeUuid = $rootScope.encounterConfig.getPatientDocumentEncounterTypeUuid();
                var promise = encounterService.getEncountersForEncounterType($rootScope.patient.uuid, encounterTypeUuid);
                promise.then(function (response) {
                    var records = new Bahmni.Clinical.PatientFileObservationsMapper().map(response.data.results);
                    angular.forEach(records, function (record) {
                        imageGalleryController.addImage(record);
                    });
                    if (scope.current != null) {
                        imageGalleryController.setIndex(scope.currentObservation);
                    }
                    imageGalleryController.open();
                });
            });
        };
        return {
            link: link,
            scope: {
                currentObservation: "=?index"    
            },
            require: '^imageObservationGallery'
        }
    }]);