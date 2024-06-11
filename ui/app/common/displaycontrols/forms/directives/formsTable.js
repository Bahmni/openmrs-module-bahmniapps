'use strict';

angular.module('bahmni.common.displaycontrol.forms')
    .directive('formsTable', ['conceptSetService', 'spinner', '$q', 'visitFormService', 'appService', '$state', '$rootScope',
        function (conceptSetService, spinner, $q, visitFormService, appService, $state, $rootScope) {
            var defaultController = function ($scope) {
                $scope.shouldPromptBrowserReload = true;
                $scope.showFormsDate = appService.getAppDescriptor().getConfigValue("showFormsDate");
                var getAllObservationTemplates = function () {
                    return conceptSetService.getConcept({
                        name: "All Observation Templates",
                        v: "custom:(setMembers:(display))"
                    });
                };
                var obsFormData = function () {
                    return visitFormService.formData($scope.patient.uuid, $scope.section.dashboardConfig.maximumNoOfVisits, $scope.section.formGroup, $state.params.enrollment);
                };

                var filterFormData = function (formData) {
                    var filterList = [];
                    _.each(formData, function (item) {
                        var foundElement = _.find(filterList, function (filteredItem) {
                            return item.concept.uuid == filteredItem.concept.uuid;
                        });
                        if (foundElement == undefined) {
                            filterList.push(item);
                        }
                    });
                    return filterList;
                };

                var sortedFormDataByLatestDate = function (formData) {
                    return _.sortBy(formData, "obsDatetime").reverse();
                };
                $scope.doesUserHaveAccessToTheForm = function (data, action) {
                    if ((data.privileges != null) && (typeof data.privileges != undefined) && (data.privileges > 0)) {
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
                            }
                        }
                    } else { return true; }
                };
                var init = function () {
                    $scope.formsNotFound = false;
                    return $q.all([getAllObservationTemplates(), obsFormData()]).then(function (results) {
                        $scope.observationTemplates = results[0].data.results[0].setMembers;
                        var sortedFormDataByDate = sortedFormDataByLatestDate(results[1].data.results);
                        if ($scope.isOnDashboard) {
                            $scope.formData = filterFormData(sortedFormDataByDate);
                        } else {
                            $scope.formData = sortedFormDataByDate;
                        }

                        if ($scope.formData.length === 0) {
                            $scope.formsNotFound = true;
                            $scope.$emit("no-data-present-event");
                        }
                    });
                };

                $scope.getDisplayName = function (data) {
                    var concept = data.concept;
                    var defaultLocale = $rootScope.currentUser.userProperties.defaultLocale;
                    var displayName = getLocaleSpecificConceptName(concept, defaultLocale, "FULLY_SPECIFIED");
                    return displayName;
                };
                var getLocaleSpecificConceptName = function (concept, locale, conceptNameType) {
                    conceptNameType = conceptNameType ? conceptNameType : "SHORT";
                    var localeSpecificName = _.filter(concept.names, function (name) {
                        return ((name.locale === locale) && (name.conceptNameType === conceptNameType));
                    });
                    if (localeSpecificName && localeSpecificName[0]) {
                        return localeSpecificName[0].display;
                    }
                    return concept.name.name;
                };

                $scope.initialization = init();

                $scope.getEditObsData = function (observation) {
                    return {
                        observation: observation,
                        conceptSetName: observation.concept.displayString,
                        conceptDisplayName: $scope.getDisplayName(observation)
                    };
                };
                $scope.shouldPromptBeforeClose = true;

                $scope.getConfigToFetchDataAndShow = function (data) {
                    return {
                        patient: $scope.patient,
                        config: {
                            conceptNames: [data.concept.displayString],
                            showGroupDateTime: false,
                            encounterUuid: data.encounterUuid,
                            observationUuid: data.uuid
                        },
                        section: {
                            title: data.concept.displayString
                        },
                        showPrintOption: $scope.section.dashboardConfig.printing ? true : false,
                        printForm: $scope.printForm
                    };
                };

                $scope.dialogData = {
                    "patient": $scope.patient,
                    "section": $scope.section
                };

                $scope.printForm = function () {
                    $rootScope.$broadcast("event:printForm", $scope.section.dashboardConfig);
                };
            };

            var link = function ($scope, element) {
                spinner.forPromise($scope.initialization, element);
            };

            return {
                restrict: 'E',
                controller: function ($scope, $controller) {
                    if ($scope.section.type && $scope.section.type === Bahmni.Common.Constants.formBuilderDisplayControlType) {
                        return $controller("versionedFormController", {$scope: $scope});
                    }
                    return defaultController($scope);
                },
                link: link,
                templateUrl: "../common/displaycontrols/forms/views/formsTable.html",
                scope: {
                    section: "=",
                    patient: "=",
                    isOnDashboard: "="
                }
            };
        }
    ]);

