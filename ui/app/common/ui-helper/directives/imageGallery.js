angular.module('bahmni.common.uiHelper')
.directive('imageGallery', function(){
        var link = function($scope, element){
            $scope.element = element;

            element.bind("$destroy", function() {
                $scope.element.magnificPopup('close');
            });
        };

        var controller = function($scope, $location) {
            var galleryName = $scope.galleryName || "default-gallery";
            var imageGalleryTarget = $scope.imageGalleryTarget || "img";

            var addFooterCounter = function() {
                var counterSpan = $('.mfp-counter>span')[0];
                var total = counterSpan.getAttribute('data-total');
                var currentIndex = counterSpan.getAttribute('data-curr');
                var index = $scope.reverseCounter ? (total - currentIndex + 1) : currentIndex;
                counterSpan.innerHTML = index + " of " + total;
            }
            this.initGallery = function() {
                var options = {
                    type:'image',
                    delegate: imageGalleryTarget,
                    key: galleryName,
                    callbacks: {
                        imageLoadComplete: addFooterCounter
                    },
                    gallery: {
                        enabled: true,
                        navigateByImgClick: false,
                        tCounter: '<span data-total="%total%" data-curr="%curr%"></span>'
                    }
                };
                $scope.element.magnificPopup(options);
            }
        };

        return {
            link: link,
            controller: controller,
            scope: {
                galleryName: '@imageGallery',
                imageGalleryTarget: '@imageGalleryTarget',
                reverseCounter: '@reverseCounter'
            }
        };
    })
.directive('imageGalleryItem', function() {
    var link = function($scope, element, attrs, imageGalleryCtrl){
        $(element).attr('data-mfp-src', attrs.imageGalleryItem || attrs.ngSrc);
        imageGalleryCtrl.initGallery();

        element.bind("$destroy", function() {
            imageGalleryCtrl.initGallery();
        });
    };

    return {
        link: link,
        require: '^imageGallery'
    };
});