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
                });
            };

            this.open = function () {
                ngDialog.open({
                    template: '../common/ui-helper/views/gallery.html',
                    className: undefined,
                    scope: $scope
                })
            };

            $scope.isActive = function (index) {
                return $scope.imageIndex === index;
            };

            $scope.showPrev = function () {
                $scope.imageIndex = ($scope.imageIndex > 0) ? --$scope.imageIndex : $scope.photos.length - 1;
            };

            $scope.showNext = function () {
                $scope.imageIndex = ($scope.imageIndex < $scope.photos.length - 1) ? ++$scope.imageIndex : 0;
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

            KeyboardJS.on('right', function () {
                $scope.$apply(function () {
                    $scope.showNext();
                });
            });
            KeyboardJS.on('left', function () {
                $scope.$apply(function () {
                    $scope.showPrev();
                });
            });
            $scope.$on('$destroy', function () {
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
                imageGalleryController.setIndex(scope.observation.imageObservation.uuid);
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
            angular.forEach(scope.list, function (record) {
                imageGalleryController.addImageObservation(record);
            });

            $(elem).click(function () {
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
    .directive("bmLazyImageObservationGalleryItems", function () {
        var link = function (scope, elem, attrs, imageGalleryController) {
            scope.promise.then(function (response) {
                angular.forEach(response, function (record) {
                    imageGalleryController.addImageObservation(record);
                });
                if (scope.currentObservation != null) {
                    imageGalleryController.setIndex(scope.currentObservation.imageObservation.uuid);
                }
                $(elem).click(function () {
                    imageGalleryController.open();
                });
            });
        };
        return {
            link: link,
            scope: {
                promise: "=",
                currentObservation: "=?index"
            },
            require: '^bmGallery'
        }
    });