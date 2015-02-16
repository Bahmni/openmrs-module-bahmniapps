"use strict";

angular.module('bahmni.adt')
    .controller('AdtController', ['$scope', '$q', '$rootScope', 'spinner', 'dispositionService', 'encounterService', 'bedService', 'appService', 'visitService', '$location', '$window', 'sessionService', 'messagingService',
        function ($scope, $q, $rootScope, spinner, dispositionService, encounterService, bedService, appService, visitService, $location, $window, sessionService, messagingService) {
            var actionConfigs = {};
            var encounterConfig = $rootScope.encounterConfig;
            var locationUuid = sessionService.getLoginLocationUuid();
            $scope.adtObservations = [];

            $scope.dashboardConfig = appService.getAppDescriptor().getConfigValue('dashboard');

            var getDefaultVisitTypeUuid = function(){
                if($scope.visit && $scope.visit.stopDatetime == null){
                    return $scope.visit.visitType.uuid;
                }
                var defaultVisitTypeName = appService.getAppDescriptor().getConfigValue('defaultVisitType');
                var visitTypes = encounterConfig.getVisitTypes();
                var defaultVisitType = visitTypes.filter(function(visitType) { return visitType.name === defaultVisitTypeName})[0];
                return defaultVisitType && defaultVisitType.uuid || null;
            };

            var defaultVisitTypeUuid = getDefaultVisitTypeUuid();
            if(defaultVisitTypeUuid == null) {
                messagingService.showMessage("error", "Please configure a default VisitType.");
            }

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
                var undoDischargeActions = appService.getAppDescriptor().getExtensions("org.bahmni.adt.undo.discharge.action", "config");
                if (encounterConfig) {
                    var Constants = Bahmni.Common.Constants;
                    actionConfigs[Constants.admissionCode] = {encounterTypeUuid: encounterConfig.getAdmissionEncounterTypeUuid(), allowedActions: admitActions};
                    actionConfigs[Constants.dischargeCode] = {encounterTypeUuid: encounterConfig.getDischargeEncounterTypeUuid(), allowedActions: dischargeActions};
                    actionConfigs[Constants.transferCode] = {encounterTypeUuid: encounterConfig.getTransferEncounterTypeUuid(), allowedActions: transferActions};
                    actionConfigs[Constants.undoDischargeCode] = {encounterTypeUuid: encounterConfig.getDischargeEncounterTypeUuid(), allowedActions: undoDischargeActions};
                }
            };

            $scope.isAdmitted = function(){
                return $scope.visit && $scope.visit.isAdmitted();
            };

            $scope.isDischarged = function(){
                return $scope.visit && $scope.visit.isDischarged();
            };

            var filterAction = function(actions, actionType){
                return _.filter(actions, function (action) {
                    return action.name.name === actionType;
                });
            };

            var getDispositionActions = function (actions) {
                if ($scope.isAdmitted()) {
                    return filterAction(actions, 'Discharge Patient');
                } else if($scope.isDischarged()) {
                    return filterAction(actions, 'Undo Discharge');
                } else {
                    return filterAction(actions, 'Admit Patient');
                }
            };

            var init = function () {
                initializeActionConfig();
                var defaultVisitType = appService.getAppDescriptor().getConfigValue('defaultVisitType');
                var visitTypes = encounterConfig.getVisitTypes();
                $scope.visitControl = new Bahmni.Common.VisitControl(visitTypes, defaultVisitType, visitService);
                return dispositionService.getDispositionActions().then(function (response) {
                    if (response.data && response.data.results && response.data.results.length) {
                        $scope.dispositionActions = getDispositionActions(response.data.results[0].answers);
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

            $scope.$watch('dispositionAction', function(){
                var dispositionCode;
                if ($scope.dispositionAction) {
                    dispositionCode = getActionCode($scope.dispositionAction);
                    if($scope.visit){
                        var selectedEncounterTypeUuid = actionConfigs[dispositionCode].encounterTypeUuid;
                        var encounterForSelectedDisposition = getEncounterFromVisitFor(selectedEncounterTypeUuid);
                        if(encounterForSelectedDisposition){
                            $scope.adtObservations = encounterForSelectedDisposition.obs;
                        }else{
                            $scope.adtObservations = [];
                        }
                    }
                }
                $scope.actions = dispositionCode ? actionConfigs[dispositionCode].allowedActions : [];
            });

            $scope.getDisplayForContinuingVisit = function(){
                //return "Continue " + $scope.currentVisitType + " Visit";
                return "Admit";
            };

            $scope.getDisplay = function(displayFunction, display){
                if(displayFunction){
                    return $scope.call(displayFunction);
                }
                return display;
            };

            $scope.startNewVisit = function(visitTypeUuid) {
                if($scope.visit){
                    visitService.endVisit($scope.visit.visitId).then(function(){
                        $scope.admit(visitTypeUuid);
                    });
                }else{
                    $scope.admit(visitTypeUuid);
                }
            };

            $scope.cancel = function () {
                $location.url(Bahmni.ADT.Constants.patientsListUrl);
            };

            $scope.call = function(functionName) {
                if(functionName){
                    return $scope[functionName]();
                }else{
                    return true;
                }
            };

            $scope.visitExists = function() {
                return $scope.visit ? true : false;
            };

            var getEncounterData = function (encounterTypeUuid,  visitTypeUuid) {
                var encounterData = {};
                encounterData.patientUuid = $scope.patient.uuid;
                encounterData.encounterTypeUuid = encounterTypeUuid;
                encounterData.visitTypeUuid = visitTypeUuid;
                encounterData.observations = $scope.adtObservations;
                encounterData.locationUuid = locationUuid;
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
                var encounterData = getEncounterData($scope.encounterConfig.getAdmissionEncounterTypeUuid(), defaultVisitTypeUuid);
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
                spinner.forPromise(encounterService.create(encounterData).then(function (response) {
                    return bedService.getBedDetailsForPatient($scope.patient.uuid).then(function (response) {
                        if(response.data.results.length > 0) {
                            return bedService.freeBed(response.data.results[0].bedId).success(function () {
                                forwardUrl(response, "onDischargeForwardTo");
                            })
                        }
                        forwardUrl(response, "onDischargeForwardTo");
                    })
                }));
            };

            $scope.undoDischarge = function () {
                var encounterData = $scope.visit.getDischargeEncounter();
                spinner.forPromise(encounterService.delete(encounterData.uuid, "Undo Discharge")).success(function (response) {
                    forwardUrl(response, "onAdmissionForwardTo");
                });
            };

            spinner.forPromise(init());
        }
    ]);
