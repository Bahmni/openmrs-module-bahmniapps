"use strict";

angular.module('bahmni.adt')
    .controller('AdtController', ['$scope', '$q', '$rootScope', 'spinner', 'dispositionService',
        'encounterService', 'bedService', 'appService', 'visitService', '$location', '$window', 'sessionService',
        'messagingService', '$anchorScroll', '$stateParams', 'ngDialog', '$filter',
        function ($scope, $q, $rootScope, spinner, dispositionService, encounterService, bedService,
                  appService, visitService, $location, $window, sessionService, messagingService, $anchorScroll,
                  $stateParams, ngDialog, $filter) {
            var actionConfigs = {};
            var encounterConfig = $rootScope.encounterConfig;
            var locationUuid = sessionService.getLoginLocationUuid();
            var visitTypes = encounterConfig.getVisitTypes();

            $scope.defaultVisitTypeName = appService.getAppDescriptor().getConfigValue('defaultVisitType');
            $scope.adtObservations = [];
            $scope.dashboardConfig = appService.getAppDescriptor().getConfigValue('dashboard');
            $scope.getAdtConceptConfig = $scope.dashboardConfig.conceptName;

            var getVisitTypeUuid = function (visitTypeName) {
                var visitType = _.find(visitTypes, {name: visitTypeName});
                return visitType && visitType.uuid || null;
            };

            var defaultVisitTypeUuid = getVisitTypeUuid($scope.defaultVisitTypeName);

            var getCurrentVisitTypeUuid = function () {
                if ($scope.visitSummary && $scope.visitSummary.dateCompleted === null) {
                    return getVisitTypeUuid($scope.visitSummary.visitType);
                }
                return defaultVisitTypeUuid;
            };

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
                var visitSummary = $scope.visitSummary;
                var stopDate = visitSummary && visitSummary.stopDateTime;
                var isVisitOpen = (stopDate === null);
                if (visitSummary && visitSummary.isDischarged() && isVisitOpen) {
                    return filterAction(actions, ["Undo Discharge"]);
                } else if (visitSummary && visitSummary.isAdmitted() && isVisitOpen) {
                    return filterAction(actions, ["Transfer Patient", "Discharge Patient"]);
                } else {
                    return filterAction(actions, ["Admit Patient"]);
                }
            };

            var getVisit = function () {
                var visitUuid = $stateParams.visitUuid;
                if (visitUuid !== 'null' && visitUuid !== '') {
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
                $scope.dashboard = Bahmni.Common.DisplayControl.Dashboard.create($scope.dashboardConfig || {}, $filter);
                $scope.sectionGroups = $scope.dashboard.getSections($scope.diseaseTemplates);

                return getVisit().then(dispositionService.getDispositionActions).then(function (response) {
                    if (response.data && response.data.results && response.data.results.length) {
                        $scope.dispositionActions = getDispositionActions(response.data.results[0].answers);
                        if ($scope.visitSummary) {
                            $scope.currentVisitType = $scope.visitSummary.visitType;
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
                return $q.when({});
            };

            $scope.call = function (functionName) {
                if (functionName) {
                    return $scope[functionName]();
                } else {
                    return $q.when({});
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
                encounterData.observations = _.filter(encounterData.observations, function (observation) {
                    return !_.isEmpty(observation.value);
                });
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

            var createEncounterAndContinue = function () {
                var currentVisitTypeUuid = getCurrentVisitTypeUuid();
                if (currentVisitTypeUuid !== null) {
                    var encounterData = getEncounterData($scope.encounterConfig.getAdmissionEncounterTypeUuid(), currentVisitTypeUuid);
                    return encounterService.create(encounterData).success(function (response) {
                        if ($scope.visitSummary === null) {
                            visitService.getVisitSummary(response.visitUuid).then(function (response) {
                                $scope.visitSummary = new Bahmni.Common.VisitSummary(response.data);
                            });
                        }
                        forwardUrl(response, "onAdmissionForwardTo");
                    });
                } else if ($scope.defaultVisitTypeName === null) {
                    messagingService.showMessage("error", "MESSAGE_DEFAULT_VISIT_TYPE_NOT_FOUND_KEY");
                } else {
                    messagingService.showMessage("error", "MESSAGE_DEFAULT_VISIT_TYPE_INVALID_KEY");
                }
                return $q.when({});
            };

            $scope.admit = function () {
                if ($scope.visitSummary && $scope.visitSummary.visitType !== $scope.defaultVisitTypeName) {
                    ngDialog.openConfirm({template: 'views/visitChangeConfirmation.html', scope: $scope, closeByEscape: true});
                } else {
                    return createEncounterAndContinue();
                }
                return $q.when({});
            };

            $scope.cancelConfirmationDialog = function () {
                ngDialog.close();
            };

            $scope.closeCurrentVisitAndStartNewVisit = function () {
                if (defaultVisitTypeUuid !== null) {
                    var encounter = getEncounterData($scope.encounterConfig.getAdmissionEncounterTypeUuid(), defaultVisitTypeUuid);
                    visitService.endVisitAndCreateEncounter($scope.visitSummary.uuid, encounterService.buildEncounter(encounter)).success(function (response) {
                        visitService.getVisitSummary(response.visitUuid).then(function (response) {
                            $scope.visitSummary = new Bahmni.Common.VisitSummary(response.data);
                        });
                        forwardUrl(response, "onAdmissionForwardTo");
                    });
                } else if ($scope.defaultVisitTypeName === null) {
                    messagingService.showMessage("error", "MESSAGE_DEFAULT_VISIT_TYPE_NOT_FOUND_KEY");
                } else {
                    messagingService.showMessage("error", "MESSAGE_DEFAULT_VISIT_TYPE_INVALID_KEY");
                }
                ngDialog.close();
                return $q.when({});
            };

            $scope.continueWithCurrentVisit = function () {
                createEncounterAndContinue();
                ngDialog.close();
            };

            $scope.transfer = function () {
                var encounterData = getEncounterData($scope.encounterConfig.getTransferEncounterTypeUuid(), getCurrentVisitTypeUuid());
                return encounterService.create(encounterData).then(function (response) {
                    forwardUrl(response.data, "onTransferForwardTo");
                });
            };

            $scope.discharge = function () {
                var encounterData = getEncounterData($scope.encounterConfig.getDischargeEncounterTypeUuid());
                return spinner.forPromise(encounterService.discharge(encounterData).then(function (response) {
                    forwardUrl(response.data, "onDischargeForwardTo");
                }));
            };

            $scope.undoDischarge = function () {
                return spinner.forPromise(encounterService.delete($scope.visitSummary.getDischargeEncounterUuid(), "Undo Discharge")).then(function () {
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
