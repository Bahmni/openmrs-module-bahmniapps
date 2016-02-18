'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('obsConstraints', function () {
        var attributesMap = {'Numeric': 'number', 'Date': 'date', 'Datetime': 'datetime'};
        var link = function ($scope, element) {
            var attributes = {}, primaryObs;
            var obsConcept = $scope.obs.concept;
            if (obsConcept.conceptClass == Bahmni.Common.Constants.conceptDetailsClassName) {
                primaryObs = $scope.obs.getPrimaryObs();
                obsConcept = primaryObs.concept;
            }
            attributes['type'] = attributesMap[obsConcept.dataType] || "text";
            if (attributes['type'] === 'number') {
                attributes['step'] = 'any';
            }
            if (obsConcept.hiNormal) {
                attributes['max'] = obsConcept.hiNormal;
            }
            if (obsConcept.lowNormal) {
                attributes['min'] = obsConcept.lowNormal;
            }
            if(attributes['type'] == 'date') {
                if($scope.obs.conceptUIConfig == null || !$scope.obs.conceptUIConfig['allowFutureDates']) {
                    attributes['max'] = moment().format("YYYY-MM-DD");
                }
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
