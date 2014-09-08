angular.module('bahmni.common.gallery')
    .directive('bmGalleryPane', ['$rootScope', '$document', function ($rootScope, $document) {

        var $body = $document.find('body');

        $rootScope.$on('$stateChangeStart', function () {
            close();
        });

        var link = function ($scope, element) {
            $scope.galleryElement = element;
            $body.prepend($scope.galleryElement).addClass('gallery-open');

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
        };

        function close() {
            $('body #gallery-pane').remove();
            $body.removeClass('gallery-open');
            KeyboardJS.clear('right');
            KeyboardJS.clear('left');
        }

        var controller = function ($scope) {
            $scope.imageIndex = $scope.imagePosition.index ? $scope.imagePosition.index : 0;
            $scope.albumTag = $scope.imagePosition.tag ? $scope.imagePosition.tag : 'defaultTag';

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
                }
                else {
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
        };

        return {
            link: link,
            controller: controller,
            templateUrl: '../common/gallery/views/gallery.html'
        }
    }]);
