"use strict";

angular.module('opd.adt.controllers')
    .controller('AdtController', ['$scope', '$q', '$rootScope', 'spinner', 'dispositionService', 'encounterService', 'BedService', 'appService', 'visitService',
        function ($scope, $q, $rootScope, spinner, dispositionService, encounterService, bedService, appService, visitService) {
            var rankActions = {};
            var actionConfigs = {};
            var encounterConfig = $rootScope.encounterConfig;
            var Constants = Bahmni.Opd.ADT.Constants;
            $scope.adtObservations = [];

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
            };

            var setDispositionActionFromVisit = function(){
                var encounterWithHigestRank = getEncounterWithHigestRank();
                if (encounterWithHigestRank) {
                    $scope.adtObservations = encounterWithHigestRank.obs;
                }
                $scope.dispositionAction = encounterWithHigestRank ? getAdtActionForEncounterType(encounterWithHigestRank.encounterType.uuid) : null;
            };

            var getVisitEncounterFor = function(encounterTypeUuid) {
                var matchedEncounters = $scope.visit.encounters.filter(function (encounter) {
                    return encounter.encounterType.uuid && encounter.encounterType.uuid == encounterTypeUuid;
                });
                return matchedEncounters[0];
            };

            var init = function () {
                $scope.admitActions = appService.getAppDescriptor().getExtensions("org.bahmni.adt.admit.action", "config");
                $scope.visitTypes = $rootScope.encounterConfig.getVisitTypes();
                return dispositionService.getDispositionActions().then(function (response) {
                    if (response.data && response.data.results && response.data.results.length) {
                        $rootScope.disposition = $rootScope.disposition || {};
                        $rootScope.disposition.dispositionActionUuid = response.data.results[0].uuid;
                        $scope.dispositionActions = response.data.results[0].answers;
                        if($scope.visit){
                            setDispositionActionFromVisit();
                        }
                    }
                });
            };

            $scope.call = function(functionName) {
                if(functionName){
                    $scope[functionName]();
                }else{
                    return true;
                }
            };

            $scope.visitExists = function() {
                if($scope.visit){
                    return true;
                }
                return false;
            };

            $scope.save = function () {
                var actionConfig = actionConfigs[getSelectedDispositionCode()];
                if (actionConfig) {
                    actionConfig.action();
                } else {
                    $rootScope.server_error = "Oops! The system can't yet process the selected action.";
                }
                
            };

            $scope.startNewVisit = function(visitTypeUuid) {
                if($scope.visit){
                    visitService.endVisit($scope.visit.uuid).success(function(){
                        admit(visitTypeUuid);
                    });
                }else{
                    admit(visitTypeUuid);
                }
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
                if($scope.visit){
                    var selectedEncounterTypeUuid = actionConfig[getSelectedDispositionCode()].encounterTypeUuid;
                    var encounterForSelectedDisposition = getVisitEncounterFor(selectedEncounterTypeUuid);
                    if(encounterForSelectedDisposition){
                        $scope.adtObservations = encounterForSelectedDisposition.obs;
                    }else{
                        $scope.adtObservations = [];
                    }
                }
            };

            var getAdtActionForEncounterType = function(encounterTypeUuid) {
                var adtActionsForType =  $scope.dispositionActions.filter(function (dispositionAction) {
                    var actionConfig = actionConfigs[$scope.getActionCode(dispositionAction)];
                    return actionConfig ? actionConfig.encounterTypeUuid === encounterTypeUuid : false;
                });
                return adtActionsForType.length > 0 ? adtActionsForType[0] : null;

            };

            var getSelectedDispositionCode = function () {
                if ($scope.dispositionAction) {
                    return $scope.getActionCode($scope.dispositionAction);
                }
                return null;
            };

            var getEncounterData = function (encounterTypeUuid,  visitTypeUuid) {
                var encounterData = {};
                encounterData.patientUuid = $scope.patient.uuid;
                encounterData.encounterTypeUuid = encounterTypeUuid;
                encounterData.visitTypeUuid = visitTypeUuid;
                encounterData.observations = $scope.adtObservations;
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

            var admit = function (visitTypeUuid) {
                var encounterData = getEncounterData($scope.encounterConfig.getAdmissionEncounterTypeUuid(), visitTypeUuid);
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

            spinner.forPromise(init());
        }
    ]);
