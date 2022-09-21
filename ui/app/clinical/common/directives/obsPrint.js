'use strict';
angular.module('bahmni.clinical')
    .directive('obsPrint', [function () {
        var link = function ($scope, elem, attrs) {
            $scope.contentUrl = $scope.templateUrlName || 'common/views/printNestedObs.html';
        };

        return {
            restrict: 'E',
            link: link,
            template: '<ng-include src="contentUrl"/>',
            scope: {
                title: '=',
                obsToPrint: '=',
                templateUrlName: '='
            }
        };
    }]);
