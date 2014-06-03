angular.module('opd.documentupload')
    .directive('nonSanitizedSrc', function() {
        var link = function(scope, element, attrs) {
            element[0].src = attrs.nonSanitizedSrc;
        }

        return {
            restrict: 'A',
            link: link
        }
    });