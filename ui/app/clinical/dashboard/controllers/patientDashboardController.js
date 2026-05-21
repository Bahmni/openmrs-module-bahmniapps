/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardController', ['$scope', 'clinicalAppConfigService', 'clinicalDashboardConfig', 'printer',
        '$state', 'spinner', 'visitSummary', 'appService', '$stateParams', 'diseaseTemplateService', 'patientContext', '$location', '$filter', 'formDraftService', '$rootScope', 'ngDialog', '$timeout',
        function ($scope, clinicalAppConfigService, clinicalDashboardConfig, printer,
            $state, spinner, visitSummary, appService, $stateParams, diseaseTemplateService, patientContext, $location, $filter, formDraftService, $rootScope, ngDialog, $timeout) {
            $scope.enableFormDraftFeature = appService.getAppDescriptor().getConfigValue('enableFormDraftFeature');
            $scope.patient = patientContext.patient;
            $scope.activeVisit = $scope.visitHistory.activeVisit;
            $scope.activeVisitData = {};
            $scope.obsIgnoreList = clinicalAppConfigService.getObsIgnoreList();
            $scope.clinicalDashboardConfig = clinicalDashboardConfig;
            $scope.visitSummary = visitSummary;
            $scope.enrollment = $stateParams.enrollment;
            $scope.isDashboardPrinting = false;

            var getDraftTimestamp = function () {
                var now = new Date();
                return {
                    date: $filter('date')(now, 'dd MMM yyyy'),
                    time: $filter('date')(now, 'hh:mm a')
                };
            };
            var draftTimestampObj = getDraftTimestamp();
            $scope.formDraft = {
                draftDate: draftTimestampObj.date,
                draftTime: draftTimestampObj.time,
                hasDrafts: false,
                discardSuccess: false
            };
            var programConfig = appService.getAppDescriptor().getConfigValue("program") || {};
            $state.discardChanges = false;

            $scope.ipdDashboard = {
                hostData: {
                    patientId: $stateParams.patientUuid,
                    forDate: new Date().toUTCString()
                }
            };

            $scope.alergyData = {
                name: 'Customised for me!!!'
            };

            $scope.alergyApi = {
                callback: function () {
                    alert("We have a full fledged problem");
                }
            };

            $scope.stateChange = function () {
                return $state.current.name === 'patient.dashboard.show';
            };

            $scope.resumeDraft = function () {
                if (!$scope.enableFormDraftFeature) {
                    return;
                }
                $state.go('patient.dashboard.show.observations', {
                    conceptSetGroupName: 'All Observation Templates'
                });
            };

            var discardSuccessTimeout;

            $scope.confirmDiscardDraft = function () {
                var dialogScope = $scope.$new();
                var dialog = ngDialog.open({
                    template: 'dashboard/views/discardDraftConfirmation.html',
                    scope: dialogScope,
                    className: 'ngdialog-theme-default discard-draft-modal'
                });
                dialogScope.cancel = function () {
                    ngDialog.close(dialog.id);
                };
                dialogScope.discardDraft = function () {
                    var patientUuid = $scope.patient ? $scope.patient.uuid : null;
                    var providerUuid = $rootScope.currentProvider ? $rootScope.currentProvider.uuid : null;
                    formDraftService.discardDraft(patientUuid, providerUuid).then(function () {
                        $scope.formDraft.hasDrafts = false;
                        $scope.formDraft.draftDate = null;
                        $scope.formDraft.draftTime = null;
                        $scope.formDraft.discardSuccess = true;
                        $rootScope.draftData = null;
                        $rootScope.resumeDraftOnLoad = false;
                        $rootScope.resumeDraftPatientUuid = null;
                        $rootScope.hasVisitedConsultation = false;
                        $state.dirtyConsultationForm = false;
                        $rootScope.draftDiscarded = true;
                        ngDialog.close(dialog.id);
                        discardSuccessTimeout = $timeout(function () {
                            $scope.formDraft.discardSuccess = false;
                        }, 5000);
                    }, function () {
                        ngDialog.close(dialog.id);
                    });
                };
            };

            var checkForExistingDrafts = function () {
                var patientUuid = $scope.patient ? $scope.patient.uuid : null;
                var providerUuid = $rootScope.currentProvider ? $rootScope.currentProvider.uuid : null;

                if (patientUuid && providerUuid) {
                    formDraftService.getDraft(patientUuid, providerUuid).then(
                        function (response) {
                            if (response.data && response.data.uuid && !response.data.markedAsSaved) {
                                if (!$scope.activeVisit) {
                                    formDraftService.discardDraft(patientUuid, providerUuid).then(function () {
                                        $scope.formDraft.hasDrafts = false;
                                        $scope.formDraft.draftDate = null;
                                        $scope.formDraft.draftTime = null;
                                        $rootScope.draftData = null;
                                        $rootScope.resumeDraftOnLoad = false;
                                        $rootScope.resumeDraftPatientUuid = null;
                                        $rootScope.draftDiscarded = true;
                                    });
                                } else {
                                    $scope.formDraft.hasDrafts = true;
                                    $rootScope.draftData = response.data;
                                    var serverTimestamp = response.data.timestamp;
                                    if (serverTimestamp) {
                                        var draftDate = $filter('date')(new Date(serverTimestamp), 'dd MMM yyyy');
                                        var draftTime = $filter('date')(new Date(serverTimestamp), 'hh:mm a');
                                        $scope.formDraft.draftDate = draftDate;
                                        $scope.formDraft.draftTime = draftTime;
                                    }
                                }
                            } else {
                                $scope.formDraft.hasDrafts = false;
                                $scope.formDraft.draftDate = null;
                                $scope.formDraft.draftTime = null;
                                $rootScope.draftData = null;
                            }
                        },
                        function () {
                            $scope.formDraft.hasDrafts = false;
                            $scope.formDraft.draftDate = null;
                            $scope.formDraft.draftTime = null;
                            $rootScope.draftData = null;
                        }
                    ).catch(function () {
                        $scope.formDraft.hasDrafts = false;
                        $scope.formDraft.draftDate = null;
                        $scope.formDraft.draftTime = null;
                        $rootScope.draftData = null;
                    });
                }
            };

            var cleanUpListenerSwitchDashboard = $scope.$on("event:switchDashboard", function (event, dashboard) {
                $scope.init(dashboard);
            });

            var cleanUpListenerDraftSaved = $scope.$on("draft:saved", function (event, draftTimestamp) {
                if (draftTimestamp && typeof draftTimestamp === 'object') {
                    $scope.formDraft.hasDrafts = true;
                    $scope.formDraft.draftDate = draftTimestamp.draftDate;
                    $scope.formDraft.draftTime = draftTimestamp.draftTime;
                }
            });

            var cleanUpListenerSaveSuccessful = $scope.$on("event:save-successful", function () {
                $scope.formDraft.hasDrafts = false;
                $scope.formDraft.draftDate = null;
                $scope.formDraft.draftTime = null;
            });

            var cleanUpListenerSaveStarted = $scope.$on("event:save-started", function () {
                $scope.formDraft.hasDrafts = false;
                $scope.formDraft.draftDate = null;
                $scope.formDraft.draftTime = null;
            });

            var cleanUpListenerPrintDashboard = $scope.$on("event:printDashboard", function (event, tab) {
                var printScope = $scope.$new();
                printScope.isDashboardPrinting = true;
                printScope.tabBeingPrinted = tab || clinicalDashboardConfig.currentTab;
                var dashboardModel = Bahmni.Common.DisplayControl.Dashboard.create(printScope.tabBeingPrinted, $filter);
                spinner.forPromise(diseaseTemplateService.getLatestDiseaseTemplates(
                    $stateParams.patientUuid,
                    clinicalDashboardConfig.getDiseaseTemplateSections(printScope.tabBeingPrinted),
                    null,
                    null
                ).then(function (diseaseTemplate) {
                    printScope.diseaseTemplates = diseaseTemplate;
                    printScope.sectionGroups = dashboardModel.getSections(printScope.diseaseTemplates);
                    printer.printFromScope('dashboard/views/dashboardPrint.html', printScope);
                }));
            });

            $scope.$on("$destroy", function () {
                cleanUpListenerSwitchDashboard();
                cleanUpListenerDraftSaved();
                cleanUpListenerSaveSuccessful();
                cleanUpListenerSaveStarted();
                cleanUpListenerPrintDashboard();
                if (discardSuccessTimeout) {
                    $timeout.cancel(discardSuccessTimeout);
                }
            });

            var addTabNameToParams = function (board) {
                $location.search('currentTab', board.translationKey).replace();
            };

            var getCurrentTab = function () {
                var currentTabKey = $location.search().currentTab;
                var currentTab = $state.current.dashboard;
                if (currentTabKey) {
                    currentTab = _.find(clinicalDashboardConfig.visibleTabs, function (tab) {
                        return tab.translationKey === currentTabKey;
                    });
                }
                return (currentTab != undefined ? currentTab : clinicalDashboardConfig.currentTab);
            };

            $scope.init = function (dashboard) {
                dashboard.startDate = null;
                dashboard.endDate = null;
                if (programConfig.showDetailsWithinDateRange) {
                    dashboard.startDate = $stateParams.dateEnrolled;
                    dashboard.endDate = $stateParams.dateCompleted;
                }
                $state.current.dashboard = dashboard;
                clinicalDashboardConfig.switchTab(dashboard);
                addTabNameToParams(dashboard);
                var dashboardModel = Bahmni.Common.DisplayControl.Dashboard.create(dashboard, $filter);
                diseaseTemplateService.getLatestDiseaseTemplates(
                    $stateParams.patientUuid, clinicalDashboardConfig.getDiseaseTemplateSections(), dashboard.startDate, dashboard.endDate).then(function (diseaseTemplate) {
                        $scope.diseaseTemplates = diseaseTemplate;
                        $scope.sectionGroups = dashboardModel.getSections($scope.diseaseTemplates);
                    });
                $scope.currentDashboardTemplateUrl = $state.current.views['dashboard-content'] ?
                    $state.current.views['dashboard-content'].templateUrl : $state.current.views['dashboard-content'];
            };

            $scope.init(getCurrentTab());
            checkForExistingDrafts();
        }]);
