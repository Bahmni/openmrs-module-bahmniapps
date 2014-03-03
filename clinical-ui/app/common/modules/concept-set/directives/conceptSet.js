'use strict';

angular.module('opd.conceptSet')
    .directive('showConcept', ['$rootScope', function () {
        var controller = function($scope, $q) {
            var conceptMapper = new Bahmni.ConceptSet.ConceptMapper();
    
            $scope.getPossibleAnswers = function() {
                return $scope.observation.possibleAnswers.map(conceptMapper.map);   
            }

            $scope.getValues = function(request) {
                return $q.when({data: $scope.getPossibleAnswers() });
            };
        }

        return {
            restrict: 'E',
            scope: {
                observation: "="
            },
            controller: controller,
            template: '<ng-include src="\'../common/modules/concept-set/views/observation.html\'" />'
        }
    }]).directive('showConceptSet', ['$rootScope', function () {
        var template =
            '<form>' +
                '<show-concept observation="rootObservation"></show-concept>' +
            '</form>';

        var controller = function ($scope, conceptSetService) {
            var conceptSetName = $scope.conceptSetName;
            var observationMapper = new Bahmni.ConceptSet.ObservationMapper();
            conceptSetService.getConceptSetMembers({name: conceptSetName, v: "fullchildren"}).success(function (response) {
                var conceptSet = response.results[0];
                $scope.$watch('observations', function (observations) {
                    $scope.rootObservation = conceptSet ? observationMapper.map(observations, conceptSet) : null;
                    changeObservations();
                });
            });

            $scope.observationChanged = function (observation) {
                observation.observationDateTime = new Date();
            };

            var changeObservations = function() {
                for (var i = 0; i < $scope.observations.length; i++) {
                    if($scope.observations[i].concept.uuid === $scope.rootObservation.concept.uuid) {
                        $scope.observations[i] = $scope.rootObservation;
                        return;
                    }
                };
                $scope.observations.push($scope.rootObservation);
            }
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
        var attributesMap = {'Numeric': 'number', 'Date': 'date'};
        var link = function ($scope, element, attrs, ctrl) {
            var attributes = {};
            attributes['type'] = attributesMap[$scope.obs.getDataTypeName()] || "text";
            if ($scope.obs.getHighAbsolute()) {
                attributes['max'] = $scope.obs.getHighAbsolute();
            }
            if ($scope.obs.getLowAbsolute()) {
                attributes['min'] = $scope.obs.getLowAbsolute();
            }
            element.attr(attributes);
        }

        return {
            link: link,
            scope: {
                obs: '='
            },
            require: 'ngModel'
        }
    });
