"use strict";

angular.module('bahmni.clinical').directive('observationGraph', ['observationsService', 'patientService', '$q',
    function (observationsService, patientService, $q) {

        var generateGraph = function ($scope, element, config, observationGraphModel) {
            var bindToElement = document.getElementById($scope.graphId);
            var graphWidth = $(element).width();
            Bahmni.Graph.c3Chart(bindToElement, graphWidth, config, observationGraphModel);
        };

        var link = function ($scope, element) {
            $scope.graphId = 'graph' + $scope.$id;

            if (!$scope.params) return;

            var config = new Bahmni.Clinical.ObservationGraphConfig($scope.params.config);

            if (!config.isValid()) {
                console.error("Invalid config. Will not render graph with configuration" + JSON.stringify(config));
                return;
            }

            var promises = [];
            var observationsPromise = observationsService.fetch($scope.patientUuid, config.getAllConcepts(), false, config.numberOfVisits, $scope.visitUuid);
            promises.push(observationsPromise);
            if (config.displayForAge()) {
                promises.push(patientService.getPatient($scope.patientUuid));
            }

            $q.all(promises).then(function(results) {
                if(results[0].data.length == 0) return;

                var model = Bahmni.Clinical.ObservationGraph.create(results[0].data, results[1] && results[1].data.person, config);

                generateGraph($scope, element, config, model);
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
