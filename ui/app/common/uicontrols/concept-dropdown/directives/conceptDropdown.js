(function () {
    'use strict';
    var conceptMapper = new Bahmni.Common.Domain.ConceptMapper();

    var constructSearchResult = function (concept) {
        var conceptName = concept.name.name || concept.name;
        return {
            label: conceptName,
            value: conceptName,
            concept: concept,
            uuid: concept.uuid,
            name: conceptName
        }
    };

    var getAnswersForDefaultConcept = function (defaultConcept) {
        return _(defaultConcept.answers)
            .uniq(_.property('uuid'))
            .map(conceptMapper.map)
            .map(constructSearchResult)
            .value();
    };

    var find = function (allAnswers, savedAnswer) {
        return _.find(allAnswers, function (answer) {
            return savedAnswer && (savedAnswer.uuid === answer.concept.uuid);
        });
    };

    var conceptDropdown = function ($http) {
        var source = function (request) {
            var params = {
                q: request.term,
                memberOf: request.conceptSetUuid,
                answerTo: request.codedConceptName,
                v: "custom:(uuid,name,names:(name))"
            };
            if (params.answerTo) {
                params.question = params.answerTo;
                params.s = "byQuestion";
            }
            return $http.get(Bahmni.Common.Constants.conceptUrl, {params: params});
        };
        var link = function (scope, element, attrs) {
            scope.onChange = scope.onChange();

            var response = function (answers) {
                scope.answers = answers;
                scope.model = find(answers, scope.model);
            };
            if (!scope.codedConceptName && scope.defaultConcept) {
                response(getAnswersForDefaultConcept(scope.defaultConcept));
                return;
            }
            source({
                elementId: attrs.id,
                elementType: attrs.type,
                conceptSetUuid: scope.conceptSetUuid,
                codedConceptName: scope.codedConceptName
            }).then(function (resp) {
                return resp.data.results.map(function (concept) {
                    return constructSearchResult(concept);
                });
            }).then(response);
        };

        return {
            link: link,
            restrict: 'E',
            scope: {
                model: '=',
                codedConceptName: '=?',
                defaultConcept: '=',
                onChange: '&'
            },
            templateUrl: '../common/uicontrols/concept-dropdown/views/conceptDropdown.html'
        }
    };

    angular.module('bahmni.common.conceptSet').directive('conceptDropdown', conceptDropdown);
})();