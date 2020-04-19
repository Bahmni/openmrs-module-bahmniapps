'use strict';

angular.module('bahmni.common.displaycontrol.forms')
    .controller('versionedFormController', ['$scope', 'formService', 'appService', '$q', '$state',
        function ($scope, formService, appService, $q, $state) {
            $scope.shouldPromptBrowserReload = true;
            $scope.showFormsDate = appService.getAppDescriptor().getConfigValue("showFormsDate");

            const getUniqueForms = function (formData) {
                const uniqueForms = [];
                _.each(formData, function (item) {
                    const foundElement = _.find(uniqueForms, function (filteredItem) {
                        return item.formName === filteredItem.formName;
                    });
                    if (foundElement === undefined) {
                        uniqueForms.push(item);
                    }
                });
                return uniqueForms;
            };

            const sortFormDataByLatestDate = function (formData) {
                return _.sortBy(formData, "encounterDateTime").reverse();
            };

            function filterForms (formData) {
                const filteredForms = [];
                _.each(formData, function (item) {
                    const foundElement = _.includes($scope.section.formGroup, item.formName);
                    if (foundElement) {
                        filteredForms.push(item);
                    }
                });
                return filteredForms;
            }

            var latestPublishedForms = function () {
                return formService.getFormList();
            };

            var init = function () {
                $scope.formsNotFound = false;
                return $q.all([formService.getAllPatientForms($scope.patient.uuid,
                    $scope.section.dashboardConfig.maximumNoOfVisits, $state.params.enrollment),
                    latestPublishedForms()]).then(function (results) {
                        if (!(results[0] && results[0].data.length)) {
                            $scope.formsNotFound = true;
                            $scope.$emit("no-data-present-event");
                        } else {
                            var latestForms = results[1] && results[1].data;
                            if (latestForms) {
                                $scope.formsWithNameTranslations = latestForms.map(function (latestForm) {
                                    return {
                                        formName: latestForm.name,
                                        formNameTranslations: latestForm.nameTranslation ? JSON.parse(latestForm.nameTranslation) : []
                                    };
                                });
                            }
                            var sortedFormDataByDate = sortFormDataByLatestDate(filterForms(results[0].data));
                            if ($scope.isOnDashboard) {
                                $scope.formData = getUniqueForms(sortedFormDataByDate);
                            } else {
                                $scope.formData = sortedFormDataByDate;
                            }
                        }
                    });
            };

            $scope.getDisplayName = function (data) {
                if ($scope.formsWithNameTranslations && $scope.formsWithNameTranslations.length > 0) {
                    var formWithNameTranslation = $scope.formsWithNameTranslations.find(function (formWithNameTranslation) {
                        return formWithNameTranslation.formName === data.formName;
                    });
                    var locale = localStorage.getItem("NG_TRANSLATE_LANG_KEY") || "en";
                    var currentLabel = formWithNameTranslation && formWithNameTranslation.formNameTranslations
                           .find(function (formNameTranslation) {
                               return formNameTranslation.locale === locale;
                           });
                    if (currentLabel) {
                        return currentLabel.display;
                    }
                }

                return data.formName;
            };

            $scope.initialization = init();

            $scope.shouldPromptBeforeClose = true;

            $scope.dialogData = {
                "patient": $scope.patient,
                "section": $scope.section
            };

            $scope.getConfigToFetchDataAndShow = function (data) {
                return {
                    patient: $scope.patient,
                    config: {
                        formName: data.formName,
                        showGroupDateTime: false,
                        encounterUuid: data.encounterUuid,
                        observationUuid: data.uuid,
                        formType: $scope.section.type,
                        formDisplayName: $scope.getDisplayName(data)
                    }
                };
            };

            $scope.getEditObsData = function (observation) {
                return {
                    observation: observation,
                    conceptSetName: $scope.getDisplayName(observation),
                    conceptDisplayName: $scope.getDisplayName(observation)
                };
            };
        }]);
