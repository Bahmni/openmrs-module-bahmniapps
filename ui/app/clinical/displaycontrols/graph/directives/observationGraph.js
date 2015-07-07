"use strict";

angular.module('bahmni.clinical').directive('observationGraph', ['appService', 'observationsService', 'patientService', 'conceptSetService', '$q',
    function (appService, observationsService, patientService, conceptSetService, $q) {

        var generateGraph = function ($scope, element, config, observationGraphModel) {
            var bindToElement = document.getElementById($scope.graphId);
            var graphWidth = $(element).parent().width();
            var chart = Bahmni.Graph.c3Chart.create();
            chart.render(bindToElement, graphWidth, config, observationGraphModel);
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
            var fields = ['uuid', 'name', 'names', 'hiNormal', 'lowNormal', 'units'];
            var customRepresentation = Bahmni.ConceptSet.CustomRepresentationBuilder.build(fields, 'setMembers', numberOfLevels);
            var conceptValue = conceptSetService.getConceptSetMembers({name:config.getAllConcepts() ,v:"custom:"+customRepresentation});
            promises.push(conceptValue);

            var observationsPromise = observationsService.fetch($scope.patientUuid, config.getAllConcepts(), null, config.numberOfVisits, $scope.visitUuid, null, false);
            promises.push(observationsPromise);

            if (config.displayForAge()) {
                promises.push(patientService.getPatient($scope.patientUuid));
            }

            if(config.hasReferenceData()) {
                promises.push(appService.loadConfig(config.getReferenceDataFileName()));
            }

            $q.all(promises).then(function(results) {
                var conceptData = results[0].data;
                var observations = results[1].data;
                var patient = results[2] && results[2].data.person;
                var referenceLines;
                if(config.hasReferenceData()) {
                    if (config.yAxisConcepts.length !== 1) {
                        throw new Error($scope.params.title + " Graph Source requires exactly one y-axis concept");
                    }
                    var referenceData = results[3].data;
                    var ageInMonths = Bahmni.Common.Util.AgeUtil.differenceInMonths(patient.birthdate);
                    var yAxisUnit = conceptData.results[0].units;
                    referenceLines = new Bahmni.Clinical.ObservationGraphReference(referenceData, config, patient.gender, ageInMonths, yAxisUnit).createObservationGraphReferenceLines();
                }
                if(observations.length == 0) return;

                if(conceptData.results && conceptData.results.length > 0) {
                    config.lowNormal = conceptData.results[0].lowNormal;
                    config.hiNormal = conceptData.results[0].hiNormal;
                }
                var model = Bahmni.Clinical.ObservationGraph.create(observations, patient, config, referenceLines);
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