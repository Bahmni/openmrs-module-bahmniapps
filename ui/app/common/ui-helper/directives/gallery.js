'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('bmGallery', ['$location', '$rootScope', '$compile', function ($location, $rootScope, $compile) {
        var controller = function ($scope) {
            $scope.albums = [];
            $scope.imagePosition = {
                tag: undefined,
                index: 0
            };
            this.image = function (record) {
                var provider = record.provider;
                return {
                    src: Bahmni.Common.Constants.documentsPath + '/' + record.imageObservation.value,
                    title: record.concept.name,
                    commentOnUpload: record.comment || record.imageObservation.comment,
                    date: record.imageObservation.observationDateTime,
                    uuid: record.imageObservation.uuid,
                    providerName: provider ? provider.name : null
                };
            };

            this.addImageObservation = function (record, tag) {
                return this.addImage(this.image(record), tag);
            };

            this.addImage = function (image, tag, tagOrder) {
                var matchedAlbum = getMatchingAlbum(tag);
                if (!matchedAlbum) {
                    var newAlbum = {};
                    newAlbum.tag = tag;
                    newAlbum.images = [image];
                    $scope.albums.splice(tagOrder, 0, newAlbum);
                } else {
                    var index = image.imageIndex ? image.imageIndex : matchedAlbum.images.length;
                    matchedAlbum.images.splice(index, 0, image);
                }
                return $scope.albums[0].images.length - 1;
            };

            var getMatchingAlbum = function (tag) {
                return _.find($scope.albums, function (album) {
                    return album.tag == tag;
                });
            };

            this.removeImage = function (image, tag, index) {
                var matchedAlbum = getMatchingAlbum(tag);

                if (matchedAlbum) {
                    if (matchedAlbum.images) {
                        matchedAlbum.images.splice(index, 1);
                    }
                }
            };

            this.setIndex = function (tag, index) {
                $scope.imagePosition.tag = tag;
                $scope.imagePosition.index = index;
            };

            this.open = function () {
                $compile("<div bm-gallery-pane id='gallery-pane'></div>")($scope);
            };
        };

        return {
            controller: controller,
            scope: {
                patient: "=",
                accessImpression: "=?"
            }
        };
    }])
    .directive('bmGalleryItem', function () {
        var link = function ($scope, element, attrs, imageGalleryController) {
            var image = {
                src: $scope.image.encodedValue,
                title: $scope.image.concept ? $scope.image.concept.name : "",
                date: $scope.image.obsDatetime,
                uuid: $scope.image.obsUuid,
                providerName: $scope.image.provider ? $scope.image.provider.name : "",
                imageIndex: $scope.image.imageIndex,
                commentOnUpload: $scope.image.comment
            };
            imageGalleryController.addImage(image, $scope.visitUuid, $scope.visitOrder);

            element.click(function (e) {
                e.stopPropagation();
                imageGalleryController.setIndex($scope.visitUuid, $scope.index);
                imageGalleryController.open();
            });

            element.on('$destroy', function () {
                imageGalleryController.removeImage(image, $scope.visitUuid, $scope.index);
            });
        };
        return {
            link: link,
            scope: {
                image: '=',
                index: "@",
                visitUuid: "=",
                visitOrder: "@"
            },
            require: '^bmGallery'
        };
    })
    .directive('bmImageObservationGalleryItem', function () {
        var link = function (scope, element, attrs, imageGalleryController) {
            scope.imageIndex = imageGalleryController.addImageObservation(scope.observation, 'defaultTag');
            element.click(function (e) {
                e.stopPropagation();
                imageGalleryController.setIndex('defaultTag', scope.imageIndex);
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
            scope.imageObservation = new Bahmni.Common.Obs.ImageObservation(scope.observation, scope.observation.concept, scope.observation.provider);
            scope.imageIndex = imageGalleryController.addImageObservation(scope.imageObservation, 'defaultTag');
            element.click(function (e) {
                e.stopPropagation();
                imageGalleryController.setIndex('defaultTag', scope.imageIndex);
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
                imageGalleryController.addImageObservation(record, 'defaultTag');
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
        };
    })
    .directive("bmLazyImageObservationGalleryItems", function () {
        var link = function (scope, elem, attrs, imageGalleryController) {
            scope.promise.then(function (response) {
                angular.forEach(response, function (record) {
                    var index = imageGalleryController.addImageObservation(record, 'defaultTag');
                    if (scope.currentObservation && scope.currentObservation.imageObservation.uuid == record.imageObservation.uuid) {
                        imageGalleryController.setIndex('defaultTag', index);
                    }
                });

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
        };
    });
