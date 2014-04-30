'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('obsConstraints', function () {
        var attributesMap = {'Numeric': 'number', 'Date': 'date'};
        var link = function ($scope, element, attrs, ctrl) {
            var attributes = {};
            var obs = $scope.obs;
            attributes['type'] = attributesMap[$scope.obs.dataTypeName] || "text";
            if (obs.hiNormal) {
                attributes['max'] = $scope.obs.hiNormal;
            }
            if (obs.lowNormal) {
                attributes['min'] = $scope.obs.lowNormal;
            }
            if (obs.lowNormal && obs.hiNormal) {
                attributes['title'] = "Valid from " + $scope.obs.lowNormal +" to "+ $scope.obs.hiNormal;
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
