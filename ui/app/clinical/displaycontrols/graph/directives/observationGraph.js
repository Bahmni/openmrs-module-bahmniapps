"use strict";

angular.module('bahmni.clinical').directive('observationGraph', ['observationsService',
    function (observationsService) {

        var link = function ($scope, element, attrs) {
            $scope.graphId = 'graph' + $scope.$id;

            if (!$scope.params) return;
            var config = $scope.params.config;
            observationsService.fetch($scope.patientUuid, config.yAxisConcepts, false, config.numberOfVisits, $scope.visitUuid)
                .then(function (results) {

                    if(results.data.length == 0) return;

                    var observationGraphModel = [];
                    _.map(results.data, function (obs) {
                        var observation = {};
                        observation.observationDateTime = new Date(obs.observationDateTime);
                        observation[obs.concept.name] = obs.value;
                        observationGraphModel.push(observation);
                    });

                    var bindToElement = document.getElementById($scope.graphId);
                    var graphWidth = $(element).width();
                    var graphConfig = Bahmni.Graph.observationGraphConfig(bindToElement, graphWidth, config.yAxisConcepts, observationGraphModel);
                    c3.generate(graphConfig);
                });
        };

        return {
            restrict: 'E',
            templateUrl: "displaycontrols/graph/views/observationGraph.html",
            scope: {
                params: "=",
                visitUuid: "=",
                patientUuid: "="
            },
            link: link
        };
    }]);
