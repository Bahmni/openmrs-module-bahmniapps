"use strict";

angular.module('opd.adt.controllers')
    .controller('AdtController', ['$scope', '$q', '$rootScope', 'spinner', 'dispositionService', 'encounterService', 'BedService', 'appService',
        function ($scope, $q, $rootScope, spinner, dispositionService, encounterService, bedService, appService) {
            var rankActions = {};
            var actionConfigs = {};
            var encounterConfig = $rootScope.encounterConfig;
            var Constants = Bahmni.Opd.ADT.Constants;
            $scope.activeEncounter = null;

            if ($scope.encounterConfig) {
                rankActions[encounterConfig.getAdmissionEncounterTypeUuid()] = 1;
                rankActions[encounterConfig.getTransferEncounterTypeUuid()] = 2;
                rankActions[encounterConfig.getDischargeEncounterTypeUuid()] = 3;
            }

            var getEncounterWithHigestRank = function() {
                var max = 0;
                var encounterWithHigestRank = null;
                $scope.visit.encounters.forEach(function (encounter) {
                    if (rankActions[encounter.encounterType.uuid] && rankActions[encounter.encounterType.uuid] > max) {
                        max = rankActions[encounter.encounterType.uuid];
                         encounterWithHigestRank = encounter;
                    }
                });
                return encounterWithHigestRank;
            }

            var changeActiveEncounter = function(encounterTypeUuid) {
                encounterService.activeEncounter({ patientUuid: $scope.patient.uuid, encounterTypeUuid: encounterTypeUuid, includeAll: true}).success(function (data) {
                    $scope.activeEncounter = data;
                });
            }

            var init = function () {
                var encounterWithHigestRank = getEncounterWithHigestRank();
                changeActiveEncounter(encounterWithHigestRank.encounterType.uuid);
                return dispositionService.getDispositionActions().then(function (response) {
                    if (response.data && response.data.results) {
                        if (response.data.results && response.data.results.length) {
                            $rootScope.disposition = $rootScope.disposition || {};
                            $rootScope.disposition.dispositionActionUuid = response.data.results[0].uuid;
                            $scope.dispositionActions = response.data.results[0].answers;
                            $scope.dispositionAction = encounterWithHigestRank ? getAdtActionForEncounterType(encounterWithHigestRank.encounterType.uuid) : null;
                        }
                    }
                });
            };

            spinner.forPromise(init());

            $scope.save = function () {
                actionConfigs[getSelectedDispositionCode()].action();
            };

            $scope.cancel = function () {
                window.location = Bahmni.Opd.ADT.Constants.activePatientsListUrl;
            };

            $scope.getActionCode = function (concept) {
                var mappingCode = "";
                if (concept.mappings) {
                    concept.mappings.forEach(function (mapping) {
                        var mappingSource = mapping.display.split(":")[0];
                        if (mappingSource === Bahmni.Opd.Consultation.Constants.emrapiConceptMappingSource) {
                            mappingCode = $.trim(mapping.display.split(":")[1]);
                        }
                    });
                }
                return mappingCode;
            };

            $scope.changeNote = function () {
                var selectedCode = getSelectedDispositionCode();
                var selectedEncounter = $scope.visit.encounters.filter(function (encounter) {
                    return encounter.encounterType.uuid && encounter.encounterType.uuid == actionConfigs[selectedCode].encounterTypeUuid;
                })[0];
                if (selectedEncounter) {
                    changeActiveEncounter(selectedEncounter.encounterType.uuid);
                } else {
                    $scope.activeEncounter = null;
                }
            };

            var getAdtActionForEncounterType = function(encounterTypeUuid) {
                return $scope.dispositionActions.filter(function (dispositionAction) {
                    return actionConfigs[$scope.getActionCode(dispositionAction)].encounterTypeUuid === encounterTypeUuid;
                })[0];
            }

            var getSelectedDispositionCode = function () {
                if ($scope.dispositionAction) {
                    return $scope.getActionCode($scope.dispositionAction);
                }
                return null;
            };

            var getEncounterData = function (encounterTypeUuid) {
                var encounterData = {};
                encounterData.patientUuid = $scope.patient.uuid;
                encounterData.encounterTypeUuid = encounterTypeUuid;
                encounterData.observations = $scope.activeEncounter.observations;
                return encounterData;
            };

            var forwardUrl = function (response, option) {
                var appDescriptor = appService.getAppDescriptor();
                var forwardLink = appDescriptor.getConfig(option);
                forwardLink = forwardLink && forwardLink.value;

                var options = {'patientUuid': $scope.patient.uuid, 'encounterUuid': response.encounterUuid};
                if (forwardLink) {
                    window.location = appDescriptor.formatUrl(forwardLink, options);
                }
            };

            var admit = function () {
                var encounterData = getEncounterData($scope.encounterConfig.getAdmissionEncounterTypeUuid());
                encounterService.create(encounterData).success(function (response) {
                    forwardUrl(response, "onAdmissionForwardTo");
                });
            };

            var transfer = function () {
                var encounterData = getEncounterData($scope.encounterConfig.getTransferEncounterTypeUuid());
                encounterService.create(encounterData).then(function (response) {
                    forwardUrl(response.data, "onTransferForwardTo");
                });
            };

            var discharge = function () {
                var encounterData = getEncounterData($scope.encounterConfig.getDischargeEncounterTypeUuid());
                encounterService.create(encounterData).then(function (response) {
                    bedService.getBedDetailsForPatient($scope.patient.uuid).then(function (response) {
                        bedService.freeBed(response.data.results[0].bedId).success(function () {
                            forwardUrl(response, "onDischargeForwardTo")
                        })
                    })
                });
            };

            if ($scope.encounterConfig) {
                actionConfigs[Constants.admissionCode] = {encounterTypeUuid: encounterConfig.getAdmissionEncounterTypeUuid(), action: admit};
                actionConfigs[Constants.dischargeCode] = {encounterTypeUuid: encounterConfig.getDischargeEncounterTypeUuid(), action: discharge};
                actionConfigs[Constants.transferCode] = {encounterTypeUuid: encounterConfig.getTransferEncounterTypeUuid(), action: transfer};
            }
        }
    ])
;
