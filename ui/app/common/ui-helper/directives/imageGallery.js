angular.module('bahmni.common.uiHelper')
.directive('imageGallery', function(){
        var link = function($scope, element){
            $scope.element = element;

            $scope.$on("$destroy", function() {
                $.magnificPopup.close();
            });
        };

        var controller = function($scope, $location) {
            var galleryName = $scope.galleryName || "default-gallery";

            this.initGallery = function() {
                var options = {
                    type:'image',
                    key: galleryName, 
                    gallery: {enabled: true}
                };
                $($scope.element).find('img').magnificPopup(options);
            }
        };

        return {
            link: link,
            controller: controller,
            scope: {
                galleryName: '@imageGallery'
            }
        };
    })
.directive('imageGalleryItem', function() {
    var link = function($scope, element, attrs, imageGalleryCtrl){
        $(element).attr('data-mfp-src', attrs.ngSrc);
        imageGalleryCtrl.initGallery();

        $scope.$on("$destroy", function() {
            imageGalleryCtrl.initGallery();
        });
    };

    return {
        link: link,
        require: '^imageGallery'
    };
});