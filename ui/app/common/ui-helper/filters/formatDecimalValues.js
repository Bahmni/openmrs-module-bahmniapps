'use strict';

angular.module('bahmni.common.uiHelper')
.filter('formatDecimalValues', function () {
    return function (value) {
        return value ? value.toString().replace(/.0(\s+)/g, "$1") : null;
    };
});
