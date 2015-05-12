"use strict";

angular.module('bahmni.clinical').directive('observationGraph', ['observationsService', 'patientService', 'conceptSetService', '$q',
    function (observationsService, patientService, conceptSetService, $q) {

        var generateGraph = function ($scope, element, config, observationGraphModel) {
            var bindToElement = document.getElementById($scope.graphId);
            var graphWidth = $(element).parent().width();
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

            var numberOfLevels = 1;
            var fields = ['uuid', 'name', 'names', 'hiNormal', 'lowNormal'];
            var customRepresentation = Bahmni.ConceptSet.CustomRepresentationBuilder.build(fields, 'setMembers', numberOfLevels);
            var conceptValue = conceptSetService.getConceptSetMembers({name:config.getAllConcepts() ,v:"custom:"+customRepresentation});
            promises.push(conceptValue);

            var observationsPromise = observationsService.fetch($scope.patientUuid, config.getAllConcepts(), false, config.numberOfVisits, $scope.visitUuid);
            promises.push(observationsPromise);

            if (config.displayForAge()) {
                promises.push(patientService.getPatient($scope.patientUuid));
            }

            $q.all(promises).then(function(results) {
                var conceptData = results[0].data;
                var observations = results[1];
                var patient = results[2];

                if(observations.data.length == 0) return;

                if(conceptData.results && conceptData.results.length > 0) {
                    config.lowNormal = conceptData.results[0].lowNormal;
                    config.hiNormal = conceptData.results[0].hiNormal;
                }
                var model = Bahmni.Clinical.ObservationGraph.create(observations.data, patient && patient.data.person, config);
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
