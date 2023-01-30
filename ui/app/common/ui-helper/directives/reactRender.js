'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('reactRender', function () {
        return {
            restrict: 'A',
            link: function (scope, elem) {
                if (!(elem[0].children && elem[0].children.length)) {
                    // eslint-disable-next-line no-undef
                    mountConsultation(elem[0]);
                }
            }
        };
    });
