'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('concept', ['RecursionHelper', 'spinner', '$filter',
        function (RecursionHelper, spinner, $filter) {
        var link = function (scope) {
            var hideAbnormalbuttonConfig = scope.observation && scope.observation.conceptUIConfig &&  scope.observation.conceptUIConfig['hideAbnormalButton'];

            scope.now = moment().format("YYYY-MM-DD hh:mm:ss");
            scope.showTitle = scope.showTitle === undefined ? true : scope.showTitle;
            scope.hideAbnormalButton = hideAbnormalbuttonConfig == undefined ? scope.hideAbnormalButton : hideAbnormalbuttonConfig;

            scope.cloneNew = function (observation, parentObservation) {
                var newObs = observation.cloneNew();
                var index = parentObservation.groupMembers.indexOf(observation);
                parentObservation.groupMembers.splice(index + 1, 0, newObs);
                scope.$root.$broadcast("event:addMore", newObs);
            };

            scope.removeClonedObs = function (observation, parentObservation) {
                var index = parentObservation.groupMembers.indexOf(observation);
                parentObservation.groupMembers[index].voided = true;
                observation.hidden = true;
            };

            scope.isClone = function (observation, parentObservation) {
                if (parentObservation && parentObservation.groupMembers) {
                    var index = parentObservation.groupMembers.indexOf(observation);
                    return (index > 0) ? parentObservation.groupMembers[index].label == parentObservation.groupMembers[index - 1].label : false;
                }
                return false;
            };

            scope.isRemoveValid = function (observation) {
                if (observation.getControlType() == 'image') {
                    return !observation.value;
                }
                return true;
            };

            scope.getStringValue = function (observations) {
                return observations.map(function (observation) {
                    return observation.value + ' (' + $filter('bahmniDate')(observation.date) + ")";
                }).join(", ");
            };

            scope.toggleSection = function () {
                scope.collapse = !scope.collapse;
            };

            scope.isCollapsibleSet = function () {
                return scope.showTitle;
            };

            scope.hasPDFAsValue = function () {
                return scope.observation.value && (scope.observation.value.indexOf(".pdf") > 0);
            };

            scope.$watch('collapseInnerSections', function () {
                scope.collapse = scope.collapseInnerSections;
            });

            scope.handleUpdate = function () {
                scope.$root.$broadcast("event:observationUpdated-" + scope.conceptSetName, scope.observation.concept.name, scope.rootObservation);
            }

        };

        var compile = function (element) {
            return RecursionHelper.compile(element, link);
        };

        return {
            restrict: 'E',
            compile: compile,
            scope: {
                conceptSetName: "=",
                observation: "=",
                atLeastOneValueIsSet: "=",
                showTitle: "=",
                conceptSetRequired: "=",
                rootObservation: "=",
                patient: "=",
                collapseInnerSections: "=",
                rootConcept: "&",
                hideAbnormalButton:"="
            },
            templateUrl: '../common/concept-set/views/observation.html'
        }
    }]);
