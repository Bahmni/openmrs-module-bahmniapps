"use strict";

angular.module('bahmni.clinical').directive('observationGraph', ['observationsService', 'patientService',
    function (observationsService, patientService) {

        function generateGraph($scope, element, config, observationGraphModel) {
            var bindToElement = document.getElementById($scope.graphId);
            var graphWidth = $(element).width();
            var graphConfig = Bahmni.Graph.observationGraphConfig(bindToElement, graphWidth, config, observationGraphModel);
            c3.generate(graphConfig);
        }

        function buildObservationGraphModel(config, obs, observationGraphModel, xAxisValues) {
            var observation = {};
            observation[config.xAxisConcept] = xAxisValues;
            observation[obs.concept.name] = obs.value;
            observation["units"] = obs.concept.units;
            observationGraphModel.push(observation);
        }

        var link = function ($scope, element) {
            $scope.graphId = 'graph' + $scope.$id;

            if (!$scope.params) return;

            var config = $scope.params.config;
            var concepts = config.yAxisConcepts;
            if (config.xAxisConcept != "observationDateTime" && config.xAxisConcept != "age") {
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
                    var observationGraphModel = _(results.data).uniq(function(item){
                        return item.concept.name + item.concept.units;
                    }).map(function(item) {
                        return {name: item.concept.name, units: item.concept.units, values: []}
                    }).value();

                    var entryMatchingConcept = function(graphModel, obs) {
                        return _(graphModel).find(function(item) {
                            return item.name === obs.concept.name;
                        }).values;
                    };

                    switch(config.xAxisConcept) {
                        case "observationDateTime":
                            _.map(yAxisObservations, function (obs) {
                                buildObservationGraphModel(config, obs, entryMatchingConcept(observationGraphModel, obs), new Date(obs.observationDateTime));
                            });
                            generateGraph($scope, element, config, observationGraphModel);
                            break;

                        case "age":
                            patientService.getPatient($scope.patientUuid).then(function(results) {
                                var dateUtil = Bahmni.Common.Util.DateUtil;

                                var birthdate = dateUtil.formatDateWithoutTime(results.data.person.birthdate);
                                _.map(yAxisObservations, function (obs) {
                                    var age = Bahmni.Common.Util.AgeUtil.fromBirthDateTillReferenceDate(birthdate,
                                        dateUtil.formatDateWithoutTime(obs.observationDateTime));
                                    var ageValue = age.years + "." + age.months;
                                    buildObservationGraphModel(config, obs, entryMatchingConcept(observationGraphModel, obs), ageValue);
                                });
                                generateGraph($scope, element, config, observationGraphModel);
                            });
                            break;

                        default :
                            _.each(yAxisObservations, function (yAxisObs) {
                                _.each(xAxisObservations, function (xAxisObs) {
                                    if (yAxisObs.observationDateTime == xAxisObs.observationDateTime) {
                                        buildObservationGraphModel(config, yAxisObs, entryMatchingConcept(observationGraphModel, yAxisObs), xAxisObs.value);
                                    }
                                })
                            });
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
