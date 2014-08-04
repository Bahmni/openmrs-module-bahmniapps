angular.module('bahmni.common.uiHelper')
    .directive('bmGallery', ['ngDialog', function (ngDialog) {

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

            this.addImageObservation = function (record) {
                $scope.photos.push(this.image(record));
            };

            this.addImage = function (image) {
                $scope.photos.push(image);
            };

            this.setIndex = function (uuid) {
                $scope.imageIndex = _.findIndex($scope.photos, function (photo) {
                    return uuid === photo.uuid;
                })
            };

            this.open = function () {
                ngDialog.open({
                    template: '../common/ui-helper/views/gallery.html',
                    className: undefined,
                    scope: $scope
                })
            };


            $scope._Index = $scope.imageIndex || 0;

            $scope.isActive = function (index) {
                return $scope._Index === index;
            };

            $scope.showPrev = function () {
                $scope._Index = ($scope._Index > 0) ? --$scope._Index : $scope.photos.length - 1;
            };

            $scope.showNext = function () {
                $scope._Index = ($scope._Index < $scope.photos.length - 1) ? ++$scope._Index : 0;
            };

            $scope.showPhoto = function (index) {
                $scope._Index = index;
            };

        };

        return {
            controller: controller,
            scope: {
                patient: "="
            }
        }
    }])
    .directive('bmGalleryItem', function () {
        var link = function ($scope, element, attrs, imageGalleryController) {
            var image = {
                src: $scope.image.encodedValue,
                title: $scope.image.concept ? $scope.image.concept.name : "",
                date: $scope.image.obsDatetime,
                uuid: $scope.image.obsUuid
            };
            imageGalleryController.addImage(image);
            element.click(function (e) {
                e.stopPropagation();
                imageGalleryController.setIndex($scope.image.obsUuid);
                imageGalleryController.open();
            });


            KeyboardJS.on('right', function() {
                $scope.$apply(function(){
                    $scope.showNext();
                });
            });
            KeyboardJS.on('left', function() {
                $scope.$apply(function(){
                    $scope.showPrev();
                });
            });
            $scope.$on('$destroy', function(){
                KeyboardJS.clear('right');
                KeyboardJS.clear('left');
            });

        };
        return {
            link: link,
            image: '=',
            require: '^bmGallery'
        };
    })
    .directive('bmImageObservationGalleryItem', function () {
        var link = function (scope, element, attrs, imageGalleryController) {
            imageGalleryController.addImageObservation(scope.observation);
            element.click(function (e) {
                e.stopPropagation();
                imageGalleryController.setIndex(scope.observation.uuid);
                imageGalleryController.open();
            });
        };
        return {
            link: link,
            scope: {
                observation: '='
            },
            require: '^bmGallery'
        };
    })
    .directive("bmImageObservationGalleryItems", function () {
        var link = function (scope, elem, attrs, imageGalleryController) {
            $(elem).click(function () {
                angular.forEach(scope.list, function (record) {
                    imageGalleryController.addImageObservation(record);
                });
                imageGalleryController.open();
            });
        };
        return {
            link: link,
            scope: {
                list: "="
            },
            require: '^bmGallery'
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
                        imageGalleryController.addImageObservation(record);
                    });
                    if (scope.current != null) {
                        imageGalleryController.setIndex(scope.currentObservation.imageObservation.uuid);
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
            require: '^bmGallery'
        }
    }]);