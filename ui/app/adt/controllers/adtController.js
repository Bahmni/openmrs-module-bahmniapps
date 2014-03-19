"use strict";

angular.module('bahmni.adt')
    .controller('AdtController', ['$scope', '$q', '$rootScope', 'spinner', 'dispositionService', 'encounterService', 'bedService', 'appService', 'visitService', '$location', '$window',
        function ($scope, $q, $rootScope, spinner, dispositionService, encounterService, bedService, appService, visitService, $location, $window) {
            var actionConfigs = {};
            var encounterConfig = $rootScope.encounterConfig;
            var Constants = Bahmni.ADT.Constants;
            $scope.adtObservations = [];

            var getActionCode = function (concept) {
                var mappingCode = "";
                if (concept.mappings) {
                    concept.mappings.forEach(function (mapping) {
                        var mappingSource = mapping.display.split(":")[0];
                        if (mappingSource === Bahmni.Common.Constants.emrapiConceptMappingSource) {
                            mappingCode = $.trim(mapping.display.split(":")[1]);
                        }
                    });
                }
                return mappingCode;
            };

            var getAdtActionForEncounterType = function(encounterTypeUuid) {
                var adtActionsForType =  $scope.dispositionActions.filter(function (dispositionAction) {
                    var actionConfig = actionConfigs[getActionCode(dispositionAction)];
                    return actionConfig ? actionConfig.encounterTypeUuid === encounterTypeUuid : false;
                });
                return adtActionsForType.length > 0 ? adtActionsForType[0] : null;
            };

            var getEncounterFromVisitFor = function(encounterTypeUuid) {
                var matchedEncounters = $scope.visit.encounters.filter(function (encounter) {
                    return encounter.encounterType.uuid && encounter.encounterType.uuid == encounterTypeUuid;
                });
                return matchedEncounters[0];
            };

            var initializeActionConfig = function(){
                var admitActions = appService.getAppDescriptor().getExtensions("org.bahmni.adt.admit.action", "config");
                var transferActions = appService.getAppDescriptor().getExtensions("org.bahmni.adt.transfer.action", "config");
                var dischargeActions = appService.getAppDescriptor().getExtensions("org.bahmni.adt.discharge.action", "config");
                if (encounterConfig) {
                    actionConfigs[Constants.admissionCode] = {encounterTypeUuid: encounterConfig.getAdmissionEncounterTypeUuid(), allowedActions: admitActions};
                    actionConfigs[Constants.dischargeCode] = {encounterTypeUuid: encounterConfig.getDischargeEncounterTypeUuid(), allowedActions: dischargeActions};
                    actionConfigs[Constants.transferCode] = {encounterTypeUuid: encounterConfig.getTransferEncounterTypeUuid(), allowedActions: transferActions};
                }
            };

            var init = function () {
                initializeActionConfig();
                $scope.visitTypes = encounterConfig.getVisitTypes();
                return dispositionService.getDispositionActions().then(function (response) {
                    if (response.data && response.data.results && response.data.results.length) {
                        $rootScope.disposition = $rootScope.disposition || {};
                        $rootScope.disposition.dispositionActionUuid = response.data.results[0].uuid;
                        $scope.dispositionActions = response.data.results[0].answers;
                        if($scope.visit){
                            $scope.currentVisitType = $scope.visit.visitType.display;
                            var encounterToDisplay = Bahmni.ADT.DispositionDisplayUtil.getEncounterToDisplay(encounterConfig, $scope.visit);
                            if (encounterToDisplay) {
                                $scope.adtObservations = encounterToDisplay.obs;
                                $scope.dispositionAction = getAdtActionForEncounterType(encounterToDisplay.encounterType.uuid);
                            }
                        }
                    }
                });
            };

            $scope.getDisplayForContinuingVisit = function(){
                return "Continue " + $scope.currentVisitType + " Visit";
            };

            $scope.getDisplay = function(displayFunction, display){
                if(displayFunction){
                    return $scope.call(displayFunction);
                }
                return display;
            };

            $scope.startNewVisit = function(visitTypeUuid) {
                if($scope.visit){
                    visitService.endVisit($scope.visit.uuid).success(function(){
                        $scope.admit(visitTypeUuid);
                    });
                }else{
                    $scope.admit(visitTypeUuid);
                }
            };

            $scope.cancel = function () {
                $location.url(Bahmni.ADT.Constants.activePatientsListUrl);
            };

            $scope.refreshView = function () {
                var dispositionCode;
                if ($scope.dispositionAction) {
                    dispositionCode = getActionCode($scope.dispositionAction);
                }
                if($scope.visit){
                    var selectedEncounterTypeUuid = actionConfigs[dispositionCode].encounterTypeUuid;
                    var encounterForSelectedDisposition = getEncounterFromVisitFor(selectedEncounterTypeUuid);
                    if(encounterForSelectedDisposition){
                        $scope.adtObservations = encounterForSelectedDisposition.obs;
                    }else{
                        $scope.adtObservations = [];
                    }
                }
                $scope.actions = actionConfigs[dispositionCode].allowedActions;
            };

            $scope.call = function(functionName) {
                if(functionName){
                    return $scope[functionName]();
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
                       $window.location = appDescriptor.formatUrl(forwardLink, options);
                }
            };

            $scope.admit = function (visitTypeUuid) {
                var encounterData = getEncounterData($scope.encounterConfig.getAdmissionEncounterTypeUuid(), visitTypeUuid);
                encounterService.create(encounterData).success(function (response) {
                    forwardUrl(response, "onAdmissionForwardTo");
                });
            };

            $scope.transfer = function () {
                var encounterData = getEncounterData($scope.encounterConfig.getTransferEncounterTypeUuid());
                encounterService.create(encounterData).then(function (response) {
                    forwardUrl(response.data, "onTransferForwardTo");
                });
            };

            $scope.discharge = function () {
                var encounterData = getEncounterData($scope.encounterConfig.getDischargeEncounterTypeUuid());
                encounterService.create(encounterData).then(function (response) {
                    bedService.getBedDetailsForPatient($scope.patient.uuid).then(function (response) {
                        bedService.freeBed(response.data.results[0].bedId).success(function () {
                            forwardUrl(response, "onDischargeForwardTo")
                        })
                    })
                });
            };

            spinner.forPromise(init());
        }
    ]);
