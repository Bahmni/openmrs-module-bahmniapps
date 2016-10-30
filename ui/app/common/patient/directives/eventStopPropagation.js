'use strict';

angular.module('bahmni.common.patient')
    .directive('stopEventPropagation', function () {
        return {
            link: function (scope, elem, attrs) {
                elem.on(attrs.stopEventPropagation, function (e) {
                    e.stopPropagation();
                });
            }
        };
    }
);
