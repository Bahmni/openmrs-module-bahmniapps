'use strict';

angular.module('bahmni.ipd')
    .directive('editAdtObservations', ['$rootScope', '$state', 'spinner', 'encounterService', 'observationsService', 'sessionService', 'conceptSetService', 'conceptSetUiConfigService', 'messagingService',
        function ($rootScope, $state, spinner, encounterService, observationsService, sessionService, conceptSetService, conceptSetUiConfigService, messagingService) {
            var controller = function ($scope) {
                $scope.assignBedsPrivilege = Bahmni.IPD.Constants.assignBedsPrivilege;

                var getEncounterDataFor = function (obs, encounterTypeUuid, visitTypeUuid) {
                    var encounterData = {};
                    encounterData.patientUuid = $scope.patient.uuid;
                    encounterData.encounterTypeUuid = encounterTypeUuid;
                    encounterData.visitTypeUuid = visitTypeUuid;
                    encounterData.observations = angular.copy(obs);
                    encounterData.locationUuid = sessionService.getLoginLocationUuid();
                    return encounterData;
                };

                var toggleDisabledObservation = function (editMode) {
                    $scope.editMode = editMode;
                    _.each($scope.observations[0].groupMembers, function (member) {
                        member.disabled = !editMode;
                    });
                };

                var getNonEmptyObservations = function () {
                    var observations = angular.copy($scope.observations[0]);
                    observations.groupMembers = _.filter(observations.groupMembers, function (member) {
                        return !_.isEmpty(member.value);
                    });
                    if (_.isEmpty(observations.groupMembers)) {
                        messagingService.showMessage("error", "Date of Discharge and Reason for discharge cannot be empty.");
                        setValuesForObservations($scope.savedObservations);
                        return [];
                    }
                    return [observations];
                };

                $scope.edit = function () {
                    $scope.savedObservations = angular.copy($scope.observations[0]);
                    toggleDisabledObservation(true);
                };

                $scope.save = function () {
                    toggleDisabledObservation(false);
                    var observations = getNonEmptyObservations();
                    if ($scope.visitTypeUuid !== null && !_.isEmpty(observations)) {
                        var encounterData = getEncounterDataFor(observations, $rootScope.encounterConfig.getConsultationEncounterTypeUuid(), $scope.visitTypeUuid);
                        return encounterService.create(encounterData).then(function () {
                            toggleDisabledObservation(false);
                        });
                    }
                };

                $scope.cancel = function () {
                    setValuesForObservations($scope.savedObservations);
                    toggleDisabledObservation(false);
                };

                var resetObservationValues = function () {
                    _.each($scope.observations[0].groupMembers, function (member) {
                        member.value = undefined;
                    });
                };

                var fetchLatestObsFor = function (conceptNames) {
                    return observationsService.fetch($scope.patient.uuid, conceptNames, "latest", null, null, null, null, null).then(function (response) {
                        resetObservationValues();
                        toggleDisabledObservation(false);
                        if (response.data.length) {
                            setValuesForObservations(response.data[0]);
                        }
                    });
                };

                $scope.$watch("patient", function (oldValue, newValue) {
                    if (oldValue !== newValue) {
                        return fetchLatestObsFor($scope.conceptSetName);
                    }
                });

                var getConceptSetByConceptName = function (conceptSetName) {
                    return conceptSetService.getConcept({name: conceptSetName, v: "bahmni"}).then(function (response) {
                        return response.data.results[0];
                    });
                };

                var constructObservationTemplate = function (conceptSetName) {
                    return getConceptSetByConceptName(conceptSetName).then(function (conceptSet) {
                        var observationMapper = new Bahmni.ConceptSet.ObservationMapper();
                        return observationMapper.map([], conceptSet, conceptSetUiConfigService.getConfig());
                    });
                };

                var setValuesForObservations = function (obsGroup) {
                    $scope.observations[0].value = obsGroup.value;
                    _.each(obsGroup.groupMembers, function (obsGroupMember) {
                        _.each($scope.observations[0].groupMembers, function (member) {
                            if (member.concept.uuid === obsGroupMember.concept.uuid) {
                                member.value = obsGroupMember.value;
                                member.disabled = true;
                            }
                        });
                    });
                };

                var init = function () {
                    $scope.promiseResolved = false;
                    $scope.observations = [];
                    $scope.editMode = false;
                    $scope.onBedManagement = ($state.current && $state.current.name === "bedManagement.bed");
                    return constructObservationTemplate($scope.conceptSetName).then(function (observation) {
                        $scope.observations[0] = observation;
                        toggleDisabledObservation(false);
                        $scope.promiseResolved = true;
                        if ($rootScope.patient && $rootScope.bedDetails) {
                            return observationsService.fetch($scope.patient.uuid, [$scope.conceptSetName], "latest", 1, null, null, null, null).then(function (response) {
                                if (response.data.length) {
                                    setValuesForObservations(response.data[0]);
                                }
                            });
                        }
                    });
                };

                spinner.forPromise(init());
            };

            return {
                restrict: 'E',
                scope: {
                    patient: "=",
                    conceptSetName: "=",
                    editMode: "=",
                    visitTypeUuid: "="
                },
                controller: controller,
                templateUrl: "views/editAdtObservations.html"
            };
        }]);
