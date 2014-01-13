'use strict';

angular.module('opd.conceptSet')
    .directive('showConcept', ['$rootScope', function () {
        return {
            restrict: 'E',
            scope: {
                observation: "="
            },
            template: '<ng-include src="\'../common/modules/concept-set/views/observation.html\'" />'
        }
    }]).directive('showConceptSet', ['$rootScope', function ($rootScope) {
        var template =
            '<form>' +
                '<show-concept observation="rootObservation"></show-concept>' +
            '</form>';

        var controller = function ($scope, conceptSetService) {
            var conceptSetName = $scope.conceptSetName;
            var observationMapper = new Bahmni.ConceptSet.ObservationMapper($rootScope.encounterConfig);
            $rootScope.observationList = $rootScope.observationList || {};
            conceptSetService.getConceptSetMembers({name: conceptSetName, v: "fullchildren"}).success(function (response) {
                var conceptSet = response.results[0];
                $scope.$watch('observations', function (observations) {
                    $rootScope.observationList[conceptSetName] = $scope.rootObservation = conceptSet ? observationMapper.map(observations, conceptSet) : null;
                });
            });

            $scope.observationChanged = function (observation) {
                observation.observationDateTime = new Date();
            };
        };

        return {
            restrict: 'E',
            scope: {
                conceptSetName: "=",
                observations: "="
            },
            template: template,
            controller: controller
        }
    }]).directive('addObsConstraints', function () {
        var link = function ($scope, element, attrs) {
            var input = element.find("input");
            var attributes = {};
            if ($scope.obs.isNumeric()) {
                attributes['type'] = 'number'
            }
            if ($scope.obs.getHighAbsolute()) {
                attributes['max'] = $scope.obs.getHighAbsolute();
            }
            if ($scope.obs.getLowAbsolute()) {
                attributes['min'] = $scope.obs.getLowAbsolute();
            }
            input.attr(attributes);
        }

        return {
            link: link,
            scope: {
                obs: '='
            }
        }
    });
