'use strict';

angular.module('bahmni.common.conceptSet')
    .factory('conceptGroupFormatService', ['$translate', 'appService', function ($translate, appService) {
        var conceptGroupFormatConfig = appService.getAppDescriptor().getConfigValue("obsGroupDisplayFormat") || {};
        var isConceptDefinedInConfig = function (observation) {
            if (observation.groupMembers.length > 0) {
                if ((observation.formNamespace === null && observation.obsGroupUuid !== null) || observation.formNamespace !== null) {
                    return conceptGroupFormatConfig.hasOwnProperty(observation.concept.name);
                }
            }
            return false;
        };

        var isConceptClassConceptDetails = function (observation) {
            return observation.concept.conceptClass === "Concept Details";
        };

        var isObsGroupFormatted = function (observation) {
            return isConceptClassConceptDetails(observation) || isConceptDefinedInConfig(observation);
        };

        var groupObs = function (observation) {
            if (conceptGroupFormatConfig != {}) {
                if (isConceptDefinedInConfig(observation)) {
                    var group = conceptGroupFormatConfig[observation.concept.name];
                    var interpolateParams = {};
                    observation.groupMembers.forEach(function (item) {
                        if (group.displayObsFormat.concepts.includes(item.concept.name)) {
                            interpolateParams[item.concept.name.replace(/[ ()/,]+/g, '')] = item.value.name || item.value;
                        }
                    });
                    return $translate.instant(group.displayObsFormat.translationKey, interpolateParams);
                }
            }

            if (isConceptClassConceptDetails(observation) && observation.groupMembers.length > 0) {
                var sortedGroupMembers = observation.groupMembers.sort(function (a, b) {
                    return a.conceptSortWeight - b.conceptSortWeight;
                });
                var obsValueList = [];
                sortedGroupMembers.forEach(function (obs) {
                    if (obs.concept.conceptClass !== "Abnormal") {
                        if (obs.value && obs.value.name) {
                            obsValueList.push(obs.value.name);
                        }
                        else {
                            obsValueList.push(obs.value);
                        }
                    }
                });
                return obsValueList.join(", ");
            }
        };

        var getConfig = function () {
            return conceptGroupFormatConfig;
        };

        return {
            getConfig: getConfig,
            groupObs: groupObs,
            isObsGroupFormatted: isObsGroupFormatted
        };
    }]);
