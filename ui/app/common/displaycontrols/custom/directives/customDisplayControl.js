'use strict';

angular.module('bahmni.common.displaycontrol.custom')
    .directive('customDisplayControl', [function () {
        return {
            restrict: 'E',
            template: '<div compile-html="config.template"></div>',
            scope: {
                patient: "=",
                visitUuid: "=",
                section: "=",
                config: "=",
                enrollment: "=",
                params: "=",
                visitSummary: '='
            }
        };
    }]);
