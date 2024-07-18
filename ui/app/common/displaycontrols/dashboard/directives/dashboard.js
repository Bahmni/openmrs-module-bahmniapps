'use strict';

angular.module('bahmni.common.displaycontrol.dashboard')
    .directive('dashboard', ['appService', '$stateParams', '$bahmniCookieStore', 'configurations', 'encounterService', 'spinner', 'auditLogService', 'messagingService', '$state', '$translate', 'formPrintService', function (appService, $stateParams, $bahmniCookieStore, configurations, encounterService, spinner, auditLogService, messagingService, $state, $translate, formPrintService) {
        var controller = function ($scope, $filter, $rootScope) {
            var init = function () {
                $scope.dashboard = Bahmni.Common.DisplayControl.Dashboard.create($scope.config || {}, $filter);
            };
            $scope.tabConfigName = $stateParams.tabConfigName || 'default';

            var findFormV2ReactConfig = function (sections) {
                if (!sections || sections.length === 0) {
                    return null;
                }
                var section = Object.keys(sections).map(function (key) {
                    return sections[key];
                }).find(function (section) {
                    return section.type === Bahmni.Common.Constants.formsV2ReactDisplayControlType;
                });
                return (section && section.dashboardConfig !== undefined && section.dashboardConfig !== null) ? section.dashboardConfig : null;
            };

            if ($scope.patient !== undefined) {
                var dashboardConfig = findFormV2ReactConfig($scope.config.sections);
                $scope.formData = {
                    patientUuid: $scope.patient.uuid,
                    patient: $scope.patient,
                    encounterUuid: $scope.activeEncounterUuid,
                    showEditForActiveEncounter: dashboardConfig && dashboardConfig.showEditForActiveEncounter || false,
                    numberOfVisits: dashboardConfig && dashboardConfig.maximumNoOfVisits || undefined,
                    hasNoHierarchy: $scope.hasNoHierarchy,
                    currentUser: $rootScope.currentUser,
                    consultationMapper: new Bahmni.ConsultationMapper(configurations.dosageFrequencyConfig(), configurations.dosageInstructionConfig(),
                    configurations.consultationNoteConcept(), configurations.labOrderNotesConcept()),
                    editErrorMessage: $translate.instant('CLINICAL_FORM_ERRORS_MESSAGE_KEY'),
                    showPrintOption: (dashboardConfig && dashboardConfig.printing) ? true : false
                };
                $scope.formApi = {
                    handleEditSave: function (encounter) {
                        spinner.forPromise(encounterService.create(encounter).then(function (savedResponse) {
                            var messageParams = {
                                encounterUuid: savedResponse.data.encounterUuid,
                                encounterType: savedResponse.data.encounterType
                            };
                            auditLogService.log($scope.patient.uuid, "EDIT_ENCOUNTER", messageParams, "MODULE_LABEL_CLINICAL_KEY");
                            $rootScope.hasVisitedConsultation = false;
                            $state.go($state.current, {}, {reload: true});
                            messagingService.showMessage('info', "{{'CLINICAL_SAVE_SUCCESS_MESSAGE_KEY' | translate}}");
                        }));
                    },
                    printForm: function (observations) {
                        var printData = {};
                        var mappedObservations = new Bahmni.Common.Obs.ObservationMapper().map(observations, {}, null, $translate);
                        printData.bahmniObservations = new Bahmni.Common.DisplayControl.Observation.GroupingFunctions().groupByEncounterDate(mappedObservations);
                        observations.forEach(function (obs) {
                            if (obs.formFieldPath) {
                                printData.title = obs.formFieldPath.split(".")[0];
                                return;
                            } else if (obs.groupMembers.length > 0 && obs.groupMembers[0].formFieldPath) {
                                printData.title = obs.groupMembers[0].formFieldPath.split(".")[0];
                                return;
                            }
                        });
                        printData.patient = $scope.patient;
                        printData.printConfig = dashboardConfig ? dashboardConfig.printing : {};
                        printData.printConfig.header = printData.title;
                        formPrintService.printForm(printData, observations[0].encounterUuid, $rootScope.facilityLocation);
                    }
                };
                $scope.allergyData = {
                    patient: $scope.patient,
                    provider: $rootScope.currentProvider,
                    activeVisit: $scope.visitHistory ? $scope.visitHistory.activeVisit : null,
                    allergyControlConceptIdMap: appService.getAppDescriptor().getConfigValue("allergyControlConceptIdMap")
                };
                $scope.appService = appService;
                $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName);
            }

            var checkDisplayType = function (sections, typeToCheck, index) {
                return sections[index] && sections[index]['displayType'] && sections[index]['displayType'] === typeToCheck;
            };

            var isDisplayTypeWrong = function (sections) {
                var allDisplayTypes = ['Full-Page', 'LAYOUT_75_25', 'LAYOUT_25_75', 'Half-Page'];
                return (allDisplayTypes.indexOf(sections[0]['displayType']) <= -1);
            };

            $scope.isFullPageSection = function (sections) {
                return checkDisplayType(sections, 'Full-Page', 0);
            };
            $scope.hasThreeFourthPageSection = function (sections, index) {
                return checkDisplayType(sections, 'LAYOUT_75_25', index);
            };
            $scope.isOneFourthPageSection = function (sections) {
                return checkDisplayType(sections, 'LAYOUT_25_75', 0);
            };
            $scope.isHalfPageSection = function (sections) {
                return (sections[0] && (checkDisplayType(sections, 'Half-Page', 0) || isDisplayTypeWrong(sections) || !(sections[0]['displayType'])));
            };

            $scope.containsThreeFourthPageSection = function (sections) {
                var hasThreeFourthSection = this.hasThreeFourthPageSection(sections, 0) || this.hasThreeFourthPageSection(sections, 1);
                if (sections.length == 1) {
                    return this.hasThreeFourthPageSection(sections, 0);
                }

                return hasThreeFourthSection;
            };

            $scope.filterOdd = function (index) {
                return function () {
                    return index++ % 2 === 0;
                };
            };

            $scope.filterEven = function (index) {
                return function () {
                    return index++ % 2 === 1;
                };
            };
            var unbindWatch = $scope.$watch('config', init);
            $scope.$on("$stateChangeStart", unbindWatch);
        };

        return {
            restrict: 'E',
            controller: controller,
            templateUrl: "../common/displaycontrols/dashboard/views/dashboard.html",
            scope: {
                config: "=",
                patient: "=",
                diseaseTemplates: "=",
                sectionGroups: "=",
                visitHistory: "=",
                activeVisitUuid: "=",
                visitSummary: "=",
                enrollment: "=",
                activeEncounterUuid: "="
            }
        };
    }]);
