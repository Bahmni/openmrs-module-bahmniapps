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
            '<form ng-init="init()">' +
                '<show-concept observation="rootObservation"></show-concept>' +
                '</form>';

        var controller = function ($scope, $routeParams, conceptSetService) {

            var conceptSetName = $scope.conceptSetName || $routeParams.conceptSetName;

            if (!$rootScope.observationList)
                $rootScope.observationList = {};

            $scope.init = function () {
                if (!$rootScope.observationList[conceptSetName]) {
                    var encounterTransaction = $scope.encounterTransaction();
                    if (encounterTransaction) {
                        encounterTransaction.success(function (data) {
                            if (data) {
                                $rootScope.setObservation(data);
                            }
                            else {
                                $rootScope.setObservation($rootScope.activeEncounterTransaction);
                            }
                        });
                    } else {
                        $rootScope.setObservation($rootScope.activeEncounterTransaction);
                    }
                } else {
                    $scope.rootObservation = $rootScope.observationList[conceptSetName];
                }
            };

            $rootScope.setObservation = function (activeEncounterTransaction) {
                var params = {name: conceptSetName, v: "fullchildren"}
                conceptSetService.getConceptSetMembers(params).success(function (response) {
                    if (response.results && response.results.length > 0) {
                        var conceptSet = response.results[0];
                        $rootScope.observationList[conceptSetName] =
                            new Bahmni.ConceptSet.ObservationMapper($rootScope.encounterConfig)
                                .map(activeEncounterTransaction, conceptSet);
                        $scope.rootObservation = $rootScope.observationList[conceptSetName];
                    }
                });
            }

            $scope.observationChanged = function (observation) {
                observation.observationDateTime = new Date();
            };
        };

        return {
            restrict: 'E',
            scope: {
                conceptSetName: "=",
                encounterTransaction: "&"
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
