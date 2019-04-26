'use strict';

angular.module('bahmni.common.gallery')
    .directive('bmGalleryPane', ['$rootScope', '$document', 'observationsService', 'encounterService', 'spinner', 'configurations', 'ngDialog',
        function ($rootScope, $document, observationsService, encounterService, spinner, configurations, ngDialog) {
            var $body = $document.find('body');

            $rootScope.$on('$stateChangeStart', function () {
                close();
            });

            var link = function ($scope, element) {
                $scope.galleryElement = element;
                $body.prepend($scope.galleryElement).addClass('gallery-open');

                keyboardJS.on('right', function () {
                    $scope.$apply(function () {
                        if ($scope.getTotalLength() > 1) {
                            $scope.showNext();
                        }
                    });
                });
                keyboardJS.on('left', function () {
                    $scope.$apply(function () {
                        if ($scope.getTotalLength() > 1) {
                            $scope.showPrev();
                        }
                    });
                });
            };

            function close () {
                $('body #gallery-pane').remove();
                $body.removeClass('gallery-open');
                keyboardJS.releaseKey('right');
                keyboardJS.releaseKey('left');
            }

            var controller = function ($scope) {
                $scope.imageIndex = $scope.imagePosition.index ? $scope.imagePosition.index : 0;
                $scope.albumTag = $scope.imagePosition.tag ? $scope.imagePosition.tag : 'defaultTag';
                $scope.showImpression = false;

                $scope.isActive = function (index, tag) {
                    return $scope.imageIndex == index && $scope.albumTag == tag;
                };

                var getAlbumIndex = function () {
                    return _.findIndex($scope.albums, function (album) {
                        return album.tag == $scope.albumTag;
                    });
                };

                $scope.showPrev = function () {
                    var albumIndex = getAlbumIndex();
                    if ($scope.imageIndex > 0) {
                        --$scope.imageIndex;
                    } else {
                        if (albumIndex == 0) {
                            albumIndex = $scope.albums.length;
                        }
                        var previousAlbum = $scope.albums[albumIndex - 1];
                        if (previousAlbum.images.length == 0) {
                            $scope.showPrev(albumIndex - 1);
                        }
                        $scope.albumTag = previousAlbum.tag;
                        $scope.imageIndex = previousAlbum.images.length - 1;
                    }
                };

                $scope.showNext = function () {
                    var albumIndex = getAlbumIndex();
                    if ($scope.imageIndex < $scope.albums[albumIndex].images.length - 1) {
                        ++$scope.imageIndex;
                    } else {
                        if (albumIndex == $scope.albums.length - 1) {
                            albumIndex = -1;
                        }
                        var nextAlbum = $scope.albums[albumIndex + 1];
                        if (nextAlbum.images.length == 0) {
                            $scope.showNext(albumIndex + 1);
                        }
                        $scope.albumTag = nextAlbum.tag;
                        $scope.imageIndex = 0;
                    }
                };
                $scope.isPdf = function (image) {
                    return image.src && (image.src.indexOf(".pdf") > 0);
                };

                $scope.getTotalLength = function () {
                    var totalLength = 0;
                    angular.forEach($scope.albums, function (album) {
                        totalLength += album.images.length;
                    });
                    return totalLength;
                };

                $scope.getCurrentIndex = function () {
                    var currentIndex = 1;
                    for (var i = 0; i < getAlbumIndex(); i++) {
                        currentIndex += $scope.albums[i].images.length;
                    }
                    return currentIndex + parseInt($scope.imageIndex);
                };

                $scope.close = function () {
                    close($scope);
                };

                $scope.toggleImpression = function () {
                    $scope.showImpression = !$scope.showImpression;
                };

                $scope.hasObsRelationship = function (image) {
                    return image.commentOnUpload || (image.sourceObs && image.sourceObs.length > 0);
                };

                $scope.saveImpression = function (image) {
                    var bahmniEncounterTransaction = mapBahmniEncounterTransaction(image);
                    spinner.forPromise(encounterService.create(bahmniEncounterTransaction).then(function () {
                        constructNewSourceObs(image);
                        fetchObsRelationship(image);
                    }));
                };

                var init = function () {
                    if ($scope.accessImpression) {
                        $scope.albums.forEach(function (album) {
                            album.images.forEach(function (image) {
                                fetchObsRelationship(image);
                                constructNewSourceObs(image);
                            });
                        });
                    }
                    ngDialog.openConfirm({template: '../common/gallery/views/gallery.html', scope: $scope, closeByEscape: true, className: 'gallery-dialog ngdialog-theme-default'});
                };

                var fetchObsRelationship = function (image) {
                    observationsService.getObsRelationship(image.uuid).then(function (response) {
                        image.sourceObs = response.data;
                    });
                };

                var constructNewSourceObs = function (image) {
                    image.newSourceObs = $scope.newSourceObs && $scope.newSourceObs.targetObsRelation.targetObs.uuid === image.uuid ? $scope.targetObs : {
                        value: "",
                        concept: {
                            uuid: configurations.impressionConcept().uuid
                        },
                        targetObsRelation: {
                            relationshipType: Bahmni.Common.Constants.qualifiedByRelationshipType,
                            targetObs: {
                                uuid: image.uuid
                            }
                        }
                    };
                };

                var mapBahmniEncounterTransaction = function (image) {
                    return {
                        patientUuid: $scope.patient.uuid,
                        encounterTypeUuid: configurations.encounterConfig().getConsultationEncounterTypeUuid(),
                        observations: [image.newSourceObs]
                    };
                };

                init();
            };

            return {
                link: link,
                controller: controller
            };
        }]);
