'use strict';

angular.module('bahmni.common.displaycontrol.forms')
    .directive('formsTable', ['conceptSetService', 'spinner', '$q', 'visitFormService',
        function (conceptSetService, spinner, $q, visitFormService) {
            var controller = function ($scope) {
                $scope.shouldPromptBrowserReload = true;
                var getAllObservationTemplates = function () {
                    return conceptSetService.getConcept({
                        name: "All Observation Templates",
                        v: "custom:(setMembers:(display))"
                    })
                };

                var obsFormData = function () {
                    return visitFormService.formData($scope.patient.uuid, $scope.section.dashboardParams.maximumNoOfVisits);
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

                var init = function () {
                    return $q.all([getAllObservationTemplates(), obsFormData()]).then(function (results) {
                        $scope.observationTemplates = results[0].data.results[0].setMembers;
                        var sortedFormDataByDate = sortedFormDataByLatestDate(results[1].data.results);
                        if ($scope.isOnDashboard) {
                            $scope.formData = filterFormData(sortedFormDataByDate);
                        } else {
                            $scope.formData = sortedFormDataByDate;
                        }
                    });
                };

                $scope.getDisplayName = function (data) {
                    var concept = data.concept;
                    var displayName = data.concept.displayString;
                    if (concept.names && concept.names.length === 1 && concept.names[0].name != "") {
                        displayName = concept.names[0].name;
                    }
                    else if (concept.names && concept.names.length === 2) {
                        var shortName = _.find(concept.names, {conceptNameType: "SHORT"});
                        displayName = shortName && shortName.name ? shortName.name : displayName;
                    }
                    return displayName;

                };

                spinner.forPromise(init());

                $scope.getEditObsData = function (observation) {
                    return {
                        observation: {encounterUuid: observation.encounterUuid},
                        conceptSetName: observation.concept.displayString,
                        conceptDisplayName: $scope.getDisplayName(observation)
                    }
                };
                $scope.shouldPromptBeforeClose = true;

                $scope.getConfigToFetchDataAndShow = function (data) {
                    return {
                        patient: $scope.patient,
                        config: {
                            conceptNames: [data.concept.displayString],
                            showGroupDateTime: false,
                            encounterUuid: data.encounterUuid
                        },
                        section: {
                            title: data.concept.displayString
                        }
                    };
                };

                $scope.dialogData = {
                    "patient": $scope.patient,
                    "section": $scope.section
                };
            };

            return {
                restrict: 'E',
                controller: controller,
                templateUrl: "../common/displaycontrols/forms/views/formsTable.html",
                scope: {
                    section: "=",
                    patient: "=",
                    isOnDashboard: "="
                }
            };
        }
    ]);

