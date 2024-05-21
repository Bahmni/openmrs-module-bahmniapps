'use strict';

angular.module('bahmni.common.displaycontrol.dashboard')
    .directive('dashboard', ['appService', '$stateParams', '$bahmniCookieStore', 'configurations', 'encounterService', 'spinner', 'auditLogService', 'messagingService', '$state', '$translate', '$rootScope', function (appService, $stateParams, $bahmniCookieStore, configurations, encounterService, spinner, auditLogService, messagingService, $state, $translate, $rootScope) {
        var controller = function ($scope, $filter, $rootScope) {
            var init = function () {
                $scope.dashboard = Bahmni.Common.DisplayControl.Dashboard.create($scope.config || {}, $filter);
            };
            $scope.tabConfigName = $stateParams.tabConfigName || 'default';

            if ($scope.patient !== undefined) {
                $scope.formData = {
                    patientUuid: $scope.patient.uuid,
                    patient: $scope.patient,
                    encounterUuid: $scope.activeEncounterUuid,
                    showEditForActiveEncounter: $scope.config.sections['forms-v2-react'] && $scope.config.sections['forms-v2-react'].dashboardConfig && $scope.config.sections['forms-v2-react'].dashboardConfig.showEditForActiveEncounter || false,
                    numberOfVisits: $scope.config.sections['forms-v2-react'] && $scope.config.sections['forms-v2-react'].dashboardConfig && $scope.config.sections['forms-v2-react'].dashboardConfig.maximumNoOfVisits || undefined,
                    hasNoHierarchy: $scope.hasNoHierarchy,
                    currentUser: $rootScope.currentUser,
                    consultationMapper: new Bahmni.ConsultationMapper(configurations.dosageFrequencyConfig(), configurations.dosageInstructionConfig(),
                    configurations.consultationNoteConcept(), configurations.labOrderNotesConcept()),
                    editErrorMessage: $translate.instant('CLINICAL_FORM_ERRORS_MESSAGE_KEY')
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
