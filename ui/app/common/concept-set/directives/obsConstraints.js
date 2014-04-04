'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('obsConstraints', function () {
        var attributesMap = {'Numeric': 'number', 'Date': 'date'};
        var link = function ($scope, element, attrs, ctrl) {
            var attributes = {};
            var obs = $scope.obs;
            attributes['type'] = attributesMap[$scope.obs.dataTypeName] || "text";
            if (obs.hiAbsolute) {
                attributes['max'] = $scope.obs.hiAbsolute;
            }
            if (obs.lowAbsolute) {
                attributes['min'] = $scope.obs.lowAbsolute;
            }
            if (obs.lowAbsolute && obs.hiAbsolute) {
                attributes['title'] = "Valid from " + $scope.obs.lowAbsolute +" to "+ $scope.obs.hiAbsolute;
            }
            element.attr(attributes);
        };

        return {
            link: link,
            scope: {
                obs: '='
            },
            require: 'ngModel'
        }
    });
