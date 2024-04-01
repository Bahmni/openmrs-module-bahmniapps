'use strict';

angular.module('bahmni.common.displaycontrol.forms')
    .controller('versionedFormController', ['$scope', 'formService', 'appService', '$q', '$state', '$rootScope',
        function ($scope, formService, appService, $q, $state, $rootScope) {
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
                    if ($scope.section.formGroup.length == 0) {
                        filteredForms.push(item);
                    } else {
                        const foundElement = _.includes($scope.section.formGroup, item.formName);
                        if (foundElement) {
                            filteredForms.push(item);
                        }
                    }
                });
                return filteredForms;
            }

            var latestPublishedForms = function () {
                return formService.getFormList();
            };

            var init = function () {
                $scope.formsNotFound = false;
                var privileges = [];
                return $q.all([formService.getAllPatientForms($scope.patient.uuid, $scope.section.dashboardConfig.maximumNoOfVisits, $state.params.enrollment), latestPublishedForms()]).then(function (results) {
                    if (!(results[0] && results[0].data.length)) {
                        $scope.formsNotFound = true;
                        $scope.$emit("no-data-present-event");
                    } else {
                        var formListFromObsTab = results[0] && results[0].data;
                        var attachedFormList = [];
                        var latestForms = results[1] && results[1].data;
                        var privileges = 'privileges';

                        if (latestForms) {
                            $scope.formsWithNameTranslations = latestForms.map(function (latestForm) {
                                _.each(formListFromObsTab, function (item) {
                                    if (item.formName === latestForm.name) {
                                        item['privileges'] = latestForm.privileges;
                                        attachedFormList.push(item);
                                    }
                                });
                                return {
                                    formName: latestForm.name,
                                    formNameTranslations: latestForm.nameTranslation ? JSON.parse(latestForm.nameTranslation) : []
                                };
                            });
                        }
                        if (attachedFormList.length == 0) {
                            attachedFormList = formListFromObsTab;
                        }
                        var sortedFormDataByDate = sortFormDataByLatestDate(filterForms(attachedFormList));
                        if ($scope.isOnDashboard) {
                            $scope.formData = getUniqueForms(sortedFormDataByDate);
                        } else {
                            $scope.formData = sortedFormDataByDate;
                        }
                    }
                });
            };
            $scope.doesUserHaveAccessToTheForm = function (data, action) {
                if ((typeof data.privileges != 'undefined') && (data.privileges != null) && (data.privileges.length > 0)) {
                    var editable = [];
                    var viewable = [];
                    data.privileges.forEach(function (formPrivilege) {
                        _.find($rootScope.currentUser.privileges, function (privilege) {
                            if (formPrivilege.privilegeName === privilege.name) {
                                if (action === 'edit') {
                                    editable.push(formPrivilege.editable);
                                } else {
                                    viewable.push(formPrivilege.viewable);
                                }
                            }
                        });
                    });
                    if (action === 'edit') {
                        if (editable.includes(true)) {
                            return true;
                        }
                    } else {
                        if (viewable.includes(true)) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                } else { return true; }
            };

            $scope.retrospectiveDateCheck = function (data) {
                var hasPrivilege = _.some($rootScope.currentUser.privileges, {name: 'allowDashboardFormsEdit'});
                var dashboardFormsEditDateThreshold = appService.getAppDescriptor().getConfigValue('dashboardFormsEditDateThreshold');
                if (hasPrivilege || !dashboardFormsEditDateThreshold) {
                    return true;
                }
                var formDate = new Date(data.obsDatetime || data.encounterDateTime);
                var currentDate = new Date();
                var thresholdDate = new Date(new Date().setDate(dashboardFormsEditDateThreshold));

                var startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1, 0);
                if (currentDate > thresholdDate) {
                    startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0);
                }

                if (formDate >= startDate) {
                    return true;
                }
                return false;
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
