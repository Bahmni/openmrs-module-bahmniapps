'use strict';

angular.module('bahmni.common.displaycontrol.observation')
    .directive('bahmniObservation', ['encounterService', 'observationsService', 'appService', '$q', 'spinner', '$rootScope',
        'formRecordTreeBuildService', '$translate',
        function (encounterService, observationsService, appService, $q, spinner, $rootScope,
                  formRecordTreeBuildService, $translate) {
            var controller = function ($scope) {
                $scope.print = $rootScope.isBeingPrinted || false;

                $scope.showGroupDateTime = $scope.config.showGroupDateTime !== false;

                var mapObservation = function (observations) {
                    var conceptsConfig = $scope.config.formType === Bahmni.Common.Constants.forms2Type ? {} :
                        appService.getAppDescriptor().getConfigValue("conceptSetUI") || {};

                    observations = new Bahmni.Common.Obs.ObservationMapper().map(observations, conceptsConfig);

                    if ($scope.config.conceptNames) {
                        observations = _.filter(observations, function (observation) {
                            return _.some($scope.config.conceptNames, function (conceptName) {
                                return _.toLower(conceptName) === _.toLower(_.get(observation, 'concept.name'));
                            });
                        });
                    }

                    if ($scope.config.persistOrderOfConcepts) {
                        $scope.bahmniObservations = new Bahmni.Common.DisplayControl.Observation.GroupingFunctions().persistOrderOfConceptNames(observations);
                    } else {
                        $scope.bahmniObservations = new Bahmni.Common.DisplayControl.Observation.GroupingFunctions().groupByEncounterDate(observations);
                    }

                    if (_.isEmpty($scope.bahmniObservations)) {
                        $scope.noObsMessage = $translate.instant(Bahmni.Common.Constants.messageForNoObservation);
                        $scope.$emit("no-data-present-event");
                    } else {
                        if (!$scope.showGroupDateTime) {
                            _.forEach($scope.bahmniObservations, function (bahmniObs) {
                                bahmniObs.isOpen = true;
                            });
                        } else {
                            $scope.bahmniObservations[0].isOpen = true;
                        }
                    }

                    var formObservations = _.filter(observations, function (obs) {
                        return obs.formFieldPath;
                    });

                    if (formObservations.length > 0) {
                        formRecordTreeBuildService.build($scope.bahmniObservations, $scope.hasNoHierarchy);
                    }
                };

                var fetchObservations = function () {
                    if ($scope.config.formType === Bahmni.Common.Constants.formBuilderDisplayControlType) {
                        var getFormNameAndVersion = Bahmni.Common.Util.FormFieldPathUtil.getFormNameAndVersion;
                        encounterService.findByEncounterUuid($scope.config.encounterUuid, {includeAll: false}).then(function (reponse) {
                            var encounterTransaction = reponse.data;
                            var observationsForSelectedForm = _.filter(encounterTransaction.observations, function (obs) {
                                if (obs.formFieldPath) {
                                    var obsFormNameAndVersion = getFormNameAndVersion(obs.formFieldPath);
                                    return obsFormNameAndVersion.formName === $scope.config.formName;
                                }
                            });
                            mapObservation(observationsForSelectedForm);
                        });
                        $scope.title = $scope.config.formDisplayName;
                    } else {
                        if ($scope.observations) {
                            mapObservation($scope.observations, $scope.config);
                            $scope.isFulfilmentDisplayControl = true;
                        } else {
                            if ($scope.config.observationUuid) {
                                $scope.initialization = observationsService.getByUuid($scope.config.observationUuid).then(function (response) {
                                    mapObservation([response.data], $scope.config);
                                });
                            } else if ($scope.config.encounterUuid) {
                                var fetchForEncounter = observationsService.fetchForEncounter($scope.config.encounterUuid, $scope.config.conceptNames);
                                $scope.initialization = fetchForEncounter.then(function (response) {
                                    mapObservation(response.data, $scope.config);
                                });
                            } else if ($scope.enrollment) {
                                $scope.initialization = observationsService.fetchForPatientProgram($scope.enrollment, $scope.config.conceptNames, $scope.config.scope, $scope.config.obsIgnoreList).then(function (response) {
                                    mapObservation(response.data, $scope.config);
                                });
                            } else {
                                $scope.initialization = observationsService.fetch($scope.patient.uuid, $scope.config.conceptNames,
                                    $scope.config.scope, $scope.config.numberOfVisits, $scope.visitUuid,
                                    $scope.config.obsIgnoreList, null).then(function (response) {
                                        mapObservation(response.data, $scope.config);
                                    });
                            }
                        }
                    }
                };
                $scope.translateAttributeName = function (attribute) {
                    var keyName = attribute.toUpperCase().replace(/\s\s+/g, ' ').replace(/[^a-zA-Z0-9 _]/g, "").trim().replace(/ /g, "_");
                    var translationKey = keyName;
                    var translation = $translate.instant(translationKey);
                    if (translation == translationKey) {
                        return translation;
                    }
                    return translation;
                };
                $scope.toggle = function (element) {
                    element.isOpen = !element.isOpen;
                };

                $scope.isClickable = function () {
                    return $scope.isOnDashboard && $scope.section.expandedViewConfig &&
                        ($scope.section.expandedViewConfig.pivotTable || $scope.section.expandedViewConfig.observationGraph);
                };

                fetchObservations();

                $scope.dialogData = {
                    "patient": $scope.patient,
                    "section": $scope.section
                };
            };

            var link = function ($scope, element) {
                $scope.initialization && spinner.forPromise($scope.initialization, element);
            };

            return {
                restrict: 'E',
                controller: controller,
                link: link,
                templateUrl: "../common/displaycontrols/observation/views/observationDisplayControl.html",
                scope: {
                    patient: "=",
                    visitUuid: "@",
                    section: "=?",
                    config: "=",
                    title: "=sectionTitle",
                    isOnDashboard: "=?",
                    observations: "=?",
                    message: "=?",
                    enrollment: "=?",
                    hasNoHierarchy: "@"
                }
            };
        }]);
