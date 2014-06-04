angular.module('opd.documentupload')
    .directive('lazyLoadSrc', ['$rootScope', function($rootScope) {
        $rootScope.enableImageLazyLoading = function() {
            $("img.lazy").lazyload();
        }

        var link = function(scope, element, attrs) {
            $(element[0]).attr('data-original', attrs.lazyLoadSrc);
        }

        return {
            restrict: 'A',
            link: link,
        }
    }]);