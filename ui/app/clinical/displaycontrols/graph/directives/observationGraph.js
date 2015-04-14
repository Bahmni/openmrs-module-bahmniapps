"use strict";

angular.module('bahmni.clinical').directive('observationGraph', ['observationsService', 'patientService',
    function (observationsService, patientService) {

        function generateGraph($scope, element, config, observationGraphModel) {
            var bindToElement = document.getElementById($scope.graphId);
            var graphWidth = $(element).width();
            var graphConfig = Bahmni.Graph.observationGraphConfig(bindToElement, graphWidth, config.yAxisConcepts,
                config.xAxisConcept, observationGraphModel);
            c3.generate(graphConfig);
        }

        function buildObservationGraphModel(config, obs, observationGraphModel, xAxisValues) {
            var observation = {};
            observation[config.xAxisConcept] = xAxisValues;
            observation[obs.concept.name] = obs.value;
            observationGraphModel.push(observation);
        }

        var link = function ($scope, element, attrs) {
            $scope.graphId = 'graph' + $scope.$id;

            if (!$scope.params) return;
            var config = $scope.params.config;
            var concepts = config.yAxisConcepts;
            if (config.xAxisConcept != "observationDateTime" && config.xAxisConcept != "Age") {
                concepts.push(config.xAxisConcept);
            }
            observationsService.fetch($scope.patientUuid, concepts, false, config.numberOfVisits, $scope.visitUuid)
                .then(function (results) {

                    if(results.data.length == 0) return;
                    var yAxisObservations = _.filter(results.data, function (obs) {
                        return obs.concept.name != config.xAxisConcept;
                    });

                    var xAxisObservations = _.filter(results.data, function (obs) {
                        return obs.concept.name == config.xAxisConcept;
                    });
                    var observationGraphModel = [];

                    if (config.xAxisConcept == "observationDateTime") {
                        _.map(yAxisObservations, function (obs) {
                            buildObservationGraphModel(config, obs, observationGraphModel, new Date(obs.observationDateTime));
                        });
                        generateGraph($scope, element, config, observationGraphModel);
                    } else if (config.xAxisConcept == "Age") {
                        patientService.getPatient($scope.patientUuid).then(function(results) {
                            var dateUtil = Bahmni.Common.Util.DateUtil;

                            var birthdate = dateUtil.formatDateAsDDMMMYY(results.data.person.birthdate);
                            _.map(yAxisObservations, function (obs) {
                                var ageValues = Bahmni.Common.Util.AgeUtil.fromBirthDateTillReferenceDate(birthdate,
                                    dateUtil.formatDateAsDDMMMYY(obs.observationDateTime)).months;
                                buildObservationGraphModel(config, obs, observationGraphModel, ageValues);
                            })
                            generateGraph($scope, element, config, observationGraphModel);

                        })
                    } else {
                        _.each(yAxisObservations, function (yAxisObs) {
                            _.each(xAxisObservations, function (xAxisObs) {
                                if (yAxisObs.observationDateTime == xAxisObs.observationDateTime) {
                                    buildObservationGraphModel(config, yAxisObs, observationGraphModel, xAxisObs.value);
                                }
                            })
                        })
                        generateGraph($scope, element, config, observationGraphModel);
                    }
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
