"use strict";

angular.module('bahmni.adt')
    .controller('AdtController', ['$scope', '$q', '$rootScope', 'spinner', 'dispositionService',
        'encounterService', 'bedService', 'appService', 'visitService', '$location', '$window', 'sessionService',
        'messagingService', '$anchorScroll', '$stateParams',
        function ($scope, $q, $rootScope, spinner, dispositionService, encounterService, bedService,
                  appService, visitService, $location, $window, sessionService, messagingService, $anchorScroll,
                  $stateParams) {
            var actionConfigs = {};
            var encounterConfig = $rootScope.encounterConfig;
            var locationUuid = sessionService.getLoginLocationUuid();
            $scope.adtObservations = [];

            $scope.dashboardConfig = appService.getAppDescriptor().getConfigValue('dashboard');
            $scope.getAdtConceptConfig = $scope.dashboardConfig.conceptName;

            var getDefaultVisitTypeUuid = function () {
                if ($scope.visitSummary && $scope.visitSummary.stopDatetime == null) {
                    return $scope.visitSummary.visitType;
                }
                var defaultVisitTypeName = appService.getAppDescriptor().getConfigValue('defaultVisitType');
                var visitTypes = encounterConfig.getVisitTypes();
                var defaultVisitType = visitTypes.filter(function (visitType) {
                    return visitType.name === defaultVisitTypeName
                })[0];
                return defaultVisitType && defaultVisitType.uuid || null;
            };

            var defaultVisitTypeUuid = getDefaultVisitTypeUuid();
            if (defaultVisitTypeUuid == null) {
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

            var getAdtActionForEncounterType = function (encounterTypeUuid) {
                var adtActionsForType = $scope.dispositionActions.filter(function (dispositionAction) {
                    var actionConfig = actionConfigs[getActionCode(dispositionAction)];
                    return actionConfig ? actionConfig.encounterTypeUuid === encounterTypeUuid : false;
                });
                return adtActionsForType.length > 0 ? adtActionsForType[0] : null;
            };

            var initializeActionConfig = function () {
                var admitActions = appService.getAppDescriptor().getExtensions("org.bahmni.adt.admit.action", "config");
                var transferActions = appService.getAppDescriptor().getExtensions("org.bahmni.adt.transfer.action", "config");
                var dischargeActions = appService.getAppDescriptor().getExtensions("org.bahmni.adt.discharge.action", "config");
                var undoDischargeActions = appService.getAppDescriptor().getExtensions("org.bahmni.adt.undo.discharge.action", "config");
                if (encounterConfig) {
                    var Constants = Bahmni.Common.Constants;
                    actionConfigs[Constants.admissionCode] = {
                        encounterTypeUuid: encounterConfig.getAdmissionEncounterTypeUuid(),
                        allowedActions: admitActions
                    };
                    actionConfigs[Constants.dischargeCode] = {
                        encounterTypeUuid: encounterConfig.getDischargeEncounterTypeUuid(),
                        allowedActions: dischargeActions
                    };
                    actionConfigs[Constants.transferCode] = {
                        encounterTypeUuid: encounterConfig.getTransferEncounterTypeUuid(),
                        allowedActions: transferActions
                    };
                    actionConfigs[Constants.undoDischargeCode] = {
                        encounterTypeUuid: encounterConfig.getDischargeEncounterTypeUuid(),
                        allowedActions: undoDischargeActions
                    };
                }
            };

            var filterAction = function (actions, actionTypes) {
                return _.filter(actions, function (action) {
                    return actionTypes.indexOf(action.name.name) >= 0;
                });
            };

            var getDispositionActions = function (actions) {

                if ($scope.visitSummary && $scope.visitSummary.isDischarged()) {
                    return filterAction(actions, ["Undo Discharge"]);
                } else if ($scope.visitSummary && $scope.visitSummary.isAdmitted()) {
                    return filterAction(actions, ["Transfer Patient", "Discharge Patient"]);
                } else {
                    return filterAction(actions, ["Admit Patient"]);
                }
            };

            var getVisit = function () {
                var visitUuid = $stateParams.visitUuid;
                if (visitUuid != 'null') {
                    return visitService.getVisitSummary(visitUuid).then(function (response) {
                        $scope.visitSummary = new Bahmni.Common.VisitSummary(response.data);
                    });
                } else {
                    $scope.visitSummary = null;
                    return $q.when({id: 1, status: "Returned from service.", promiseComplete: true});
                }
            };

            var init = function () {
                initializeActionConfig();
                var defaultVisitType = appService.getAppDescriptor().getConfigValue('defaultVisitType');
                var visitTypes = encounterConfig.getVisitTypes();
                $scope.visitControl = new Bahmni.Common.VisitControl(visitTypes, defaultVisitType, visitService);

                return getVisit().then(dispositionService.getDispositionActions).then(function (response) {
                    if (response.data && response.data.results && response.data.results.length) {
                        $scope.dispositionActions = getDispositionActions(response.data.results[0].answers);
                        if ($scope.visitSummary) {
                            $scope.currentVisitType = $scope.visitSummary.visitType;
                            var encounterTypeUuid = Bahmni.ADT.DispositionDisplayUtil.getEncounterToDisplay(encounterConfig, $scope.visitSummary);
                            if (encounterTypeUuid) {
                                $scope.dispositionAction = getAdtActionForEncounterType(encounterTypeUuid);
                            }
                        }
                    }
                });
            };

            $scope.$watch('dispositionAction', function () {
                var dispositionCode;
                if ($scope.dispositionAction) {
                    dispositionCode = getActionCode($scope.dispositionAction);
                }
                $scope.actions = dispositionCode ? actionConfigs[dispositionCode].allowedActions : [];
            });

            $scope.getDisplayForContinuingVisit = function () {
                return "Admit";
            };

            $scope.getDisplay = function (displayFunction, display) {
                if (displayFunction) {
                    return $scope.call(displayFunction);
                }
                return display;
            };

            $scope.startNewVisit = function (visitTypeUuid) {
                if ($scope.visitSummary) {
                    visitService.endVisit($scope.visitSummary.uuid).then(function () {
                        $scope.admit(visitTypeUuid);
                    });
                } else {
                    $scope.admit(visitTypeUuid);
                }
            };

            $scope.cancel = function () {
                $location.url(Bahmni.ADT.Constants.patientsListUrl);
            };

            $scope.call = function (functionName) {
                if (functionName) {
                    return $scope[functionName]();
                } else {
                    return true;
                }
            };

            $scope.visitExists = function () {
                return $scope.visitSummary ? true : false;
            };

            var getEncounterData = function (encounterTypeUuid, visitTypeUuid) {
                var encounterData = {};
                encounterData.patientUuid = $scope.patient.uuid;
                encounterData.encounterTypeUuid = encounterTypeUuid;
                encounterData.visitTypeUuid = visitTypeUuid;
                encounterData.observations = $scope.adtObservations;
                encounterData.observations = _.filter(encounterData.observations, function(observation) {
                    return !_.isEmpty(observation.value) ;
                })
                encounterData.locationUuid = locationUuid;
                return encounterData;
            };

            var forwardUrl = function (response, option) {
                var appDescriptor = appService.getAppDescriptor();
                var forwardLink = appDescriptor.getConfig(option);
                forwardLink = forwardLink && forwardLink.value;

                var options = {
                    'patientUuid': $scope.patient.uuid,
                    'encounterUuid': response.encounterUuid,
                    'visitUuid': response.visitUuid
                };
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
                var encounterData = getEncounterData($scope.encounterConfig.getTransferEncounterTypeUuid(), defaultVisitTypeUuid);
                encounterService.create(encounterData).then(function (response) {
                    forwardUrl(response.data, "onTransferForwardTo");
                });
            };

            $scope.discharge = function () {
                var encounterData = getEncounterData($scope.encounterConfig.getDischargeEncounterTypeUuid());
                spinner.forPromise(encounterService.create(encounterData).then(function (response) {
                    return bedService.getAssignedBedForPatient($scope.patient.uuid).then(function (bedDetails) {
                        if (bedDetails) {
                            return bedService.freeBed(bedDetails.bedId).success(function () {
                                forwardUrl(response, "onDischargeForwardTo");
                            })
                        }
                        forwardUrl(response, "onDischargeForwardTo");
                    })
                }));
            };

            $scope.undoDischarge = function () {
                spinner.forPromise(encounterService.delete($scope.visitSummary.getDischargeEncounterUuid(), "Undo Discharge")).success(function (response) {
                    var params = {
                        'encounterUuid': $scope.visitSummary.getAdmissionEncounterUuid(),
                        'visitUuid': $scope.visitSummary.uuid
                    };
                    forwardUrl(params, "onAdmissionForwardTo");
                });
            };

            spinner.forPromise(init());
            $anchorScroll();

        }
    ]);
