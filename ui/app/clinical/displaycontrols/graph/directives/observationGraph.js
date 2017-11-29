"use strict";

angular.module('bahmni.clinical').directive('observationGraph', ['appService', 'observationsService', 'patientService', 'conceptSetService', '$q', 'spinner', '$translate',
    function (appService, observationsService, patientService, conceptSetService, $q, spinner, $translate) {
        var generateGraph = function ($scope, element, config, observationGraphModel) {
            var bindToElement = document.getElementById($scope.graphId);
            var graphWidth = $(element).parent().width();
            var chart = Bahmni.Graph.c3Chart.create();
            chart.render(bindToElement, graphWidth, config, observationGraphModel);
        };

        var link = function ($scope, element) {
            $scope.graphId = 'graph' + $scope.$id;

            if (!$scope.params) {
                return;
            }

            var config = new Bahmni.Clinical.ObservationGraphConfig($scope.params.config);

            config.validate($scope.params.title);

            var promises = [];

            var numberOfLevels = 1;
            var fields = ['uuid', 'name', 'names', 'hiNormal', 'lowNormal', 'units', 'datatype'];
            var customRepresentation = Bahmni.ConceptSet.CustomRepresentationBuilder.build(fields, 'setMembers', numberOfLevels);
            var conceptValue = conceptSetService.getConcept({
                name: config.getAllConcepts(),
                v: "custom:" + customRepresentation
            });
            promises.push(conceptValue);

            var observationsPromise = observationsService.fetch($scope.patientUuid, config.getAllConcepts(), null, config.numberOfVisits, $scope.visitUuid, null, false);
            promises.push(observationsPromise);

            if (config.displayForAge()) {
                promises.push(patientService.getPatient($scope.patientUuid));
            }

            if (config.shouldDrawReferenceLines()) {
                promises.push(appService.loadCsvFileFromConfig(config.getReferenceDataFileName()));
            }

            var checkWhetherYAxisIsNumericDataType = function (yAxisConceptDetails) {
                if (yAxisConceptDetails.datatype.name !== "Numeric") {
                    var errorMsg = $translate.instant(Bahmni.Clinical.Constants.errorMessages.conceptNotNumeric)
                        .replace(":conceptName", yAxisConceptDetails.name.name)
                        .replace(":placeErrorAccurred", $scope.params.title + " config in growthChartReference.csv");
                    throw new Error(errorMsg);
                }
            };
            spinner.forPromise($q.all(promises).then(function (results) {
                var yAxisConceptDetails = results[0].data && results[0].data.results && results[0].data.results[0];
                var observations = results[1].data;
                var patient = results[2] && results[2].data.person;
                var referenceLines;

                if (config.shouldDrawReferenceLines()) {
                    checkWhetherYAxisIsNumericDataType(yAxisConceptDetails);
                    var referenceData = results[3].data;
                    var ageInMonths = Bahmni.Common.Util.AgeUtil.differenceInMonths(patient.birthdate);
                    var yAxisUnit = yAxisConceptDetails.units;
                    var observationGraphReferenceModel = new Bahmni.Clinical.ObservationGraphReference(referenceData, config, patient.gender, ageInMonths, yAxisUnit);
                    observationGraphReferenceModel.validate();
                    referenceLines = observationGraphReferenceModel.createObservationGraphReferenceLines();
                }
                if (observations.length === 0) {
                    $scope.$emit("no-data-present-event");
                    return;
                }

                if (yAxisConceptDetails !== undefined) {
                    config.lowNormal = yAxisConceptDetails.lowNormal;
                    config.hiNormal = yAxisConceptDetails.hiNormal;
                }
                var model = Bahmni.Clinical.ObservationGraph.create(observations, patient, config, referenceLines);
                generateGraph($scope, element, config, model);
            }), element);
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
