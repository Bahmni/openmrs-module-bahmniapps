'use strict';

angular.module('bahmni.common.uiHelper')
.filter('thumbnail', function () {
    return function (url, extension) {
        if (url) {
            if (extension) {
                return Bahmni.Common.Constants.documentsPath + '/' + url.replace(/(.*)\.(.*)$/, "$1_thumbnail." + extension) || null;
            }
            return Bahmni.Common.Constants.documentsPath + '/' + url.replace(/(.*)\.(.*)$/, "$1_thumbnail.$2") || null;
        }
    };
});
