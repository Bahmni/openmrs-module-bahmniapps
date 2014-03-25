angular.module('bahmni.common.uiHelper')
.directive('imageGallery', function(){
        var link = function($scope, element){
            $scope.element = element;
        };

        var controller = function($scope) {
            var galleryName = $scope.galleryName || "default-gallery";
            this.initGallery = function() {
                $($scope.element).find('img').magnificPopup({type:'image', key: galleryName, gallery: {enabled: true}});
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
    };

    return {
        link: link,
        require: '^imageGallery'
    };
});