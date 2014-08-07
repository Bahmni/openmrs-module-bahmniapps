angular.module('bahmni.common.uiHelper')
    .directive('bmGallery', ['$location', '$rootScope', '$compile',function ($location, $rootScope, $compile) {

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
                return this.addImage(this.image(record));
            };

            this.addImage = function (image) {
                $scope.photos.push(image);
                return $scope.photos.length - 1;
            };

            this.setIndex = function (index) {
                $scope.imageIndex = index;
            };
//            this.setIndex = function (uuid) {
//                $scope.imageIndex = _.findIndex($scope.photos, function (photo) {
//                    return uuid === photo.uuid;
//                });
//            };

            this.open = function () {
                var galleryPane = $compile("<div bm-gallery-pane></div>")($scope);
                $('body #content-supreme').hide();
                $scope.element = $('body').append(galleryPane);
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
            $scope.imageIndex = imageGalleryController.addImage(image);

            element.click(function (e) {
                e.stopPropagation();
                console.log($scope.imageIndex);
                imageGalleryController.setIndex($scope.imageIndex);
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
    .directive('bmObservationGalleryItem', function () {
        var link = function (scope, element, attrs, imageGalleryController) {
            scope.imageObservation = new Bahmni.Clinical.ImageObservation(scope.observation, scope.observation.concept);
            imageGalleryController.addImageObservation(scope.imageObservation);
            element.click(function (e) {
                e.stopPropagation();
                imageGalleryController.setIndex(scope.imageObservation.imageObservation.uuid);
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