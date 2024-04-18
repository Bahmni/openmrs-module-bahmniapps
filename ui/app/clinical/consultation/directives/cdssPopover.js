"use strict";

angular.module('bahmni.clinical')
    .directive('cdssPopover', [function () {
        return {
            restrict: 'E',
            templateUrl: './consultation/views/cdssPopover.html',
            scope: {
                alerts: '='
            }
        };
    }]
);
