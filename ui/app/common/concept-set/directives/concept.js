'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('concept', ['RecursionHelper', 'spinner', 'conceptSetService', '$filter',
        function (RecursionHelper, spinner, conceptSetService, $filter) {
        var link = function (scope) {
            var conceptMapper = new Bahmni.Common.Domain.ConceptMapper();
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
            scope.selectOptions = function (codedConcept) {
                var answers = _.uniqBy(codedConcept.answers, 'uuid').map(conceptMapper.map);
                return {
                    data: answers,
                    query: function (options) {
                        return options.callback({results: $filter('filter')(answers, {name: options.term})});
                    },
                    allowClear: true,
                    placeholder: 'Select',
                    formatResult: _.property('displayString'),
                    formatSelection: _.property('displayString'),
                    id: _.property('uuid')
                };
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

            scope.constructSearchResult = function(concept, searchString) {
                var matchingName = null;
                if (concept.name.name.toLowerCase().indexOf(searchString.toLowerCase()) != 0) {
                    matchingName = _.find(_.map(concept.names, 'name'), function (name) {
                        return (name != concept.name.name) && name.search(new RegExp(searchString, "i")) !== -1
                    });
                }
                return {
                    label: matchingName ? matchingName + " => " + concept.name.name : concept.name.name,
                    value: concept.name.name,
                    concept: concept,
                    uuid: concept.uuid,
                    name: concept.name.name
                }
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
