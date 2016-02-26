(function () {
    'use strict';

    var getAnswers = function (codedConcept) {
        var conceptMapper = new Bahmni.Common.Domain.ConceptMapper();
        return _.uniqBy(codedConcept.answers, _.property('uuid')).map(conceptMapper.map);
    };

    var constructSearchResult = function (concept, searchString) {
        var matchingName = null;
        var conceptName = concept.name.name || concept.name;
        if (conceptName.toLowerCase().indexOf(searchString.toLowerCase()) != 0) {
            var synonyms = _.map(concept.names, 'name');
            matchingName = _.find(synonyms, function (name) {
                return (name != conceptName) && name.search(new RegExp(searchString, "i")) !== -1
            });
        }
        return {
            label: matchingName ? matchingName + " => " + conceptName : conceptName,
            value: conceptName,
            concept: concept,
            uuid: concept.uuid,
            name: conceptName
        }
    };

    var searchWithDefaultConcept = function (request, response, scope) {
        var answers = getAnswers(scope.defaultConcept);
        var searchTerm =  request.term.trim().toLowerCase();
        var search = function (answer) {
            var answerName = answer.name && answer.name.toLowerCase();
            var defaultConceptName = scope.defaultConcept.name && scope.defaultConcept.name.toLowerCase();
            return _.includes(answerName, searchTerm) && (answerName !== defaultConceptName);
        };
        var responseMap = function (matchingAnswer) {
            return constructSearchResult(matchingAnswer, searchTerm);
        };
        var results = _(answers)
            .filter(search)
            .map(responseMap)
            .value();

        response(results);
    };

    var searchWithGivenConcept = function (request, response, scope, attrs) {
        scope.source({
            elementId: attrs.id,
            term: request.term,
            elementType: attrs.type,
            conceptSetUuid: scope.conceptSetUuid,
            codedConceptName: scope.codedConceptName
        }).then(function (resp) {
            return resp.data.results.map(function (concept) {
                return constructSearchResult(concept, request.term.trim());
            });
        }).then(response);
    };

    var conceptAutocomplete = function ($parse, $http) {

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

        var link = function (scope, element, attrs, ngModelCtrl) {
            scope.source = source;
            var minLength = scope.minLength || 2;
            var previousValue;

            var validator = function (searchTerm) {
                if (!scope.strictSelect) {
                    return;
                }
                if (_.isEmpty(searchTerm) || searchTerm === previousValue || _.isUndefined(previousValue)) {
                    element.removeClass('illegalValue');
                    return;
                }
                element.addClass('illegalValue');
            };

            element.autocomplete({
                autofocus: true,
                minLength: minLength,
                source: function (request, response) {
                    if (scope.codedConceptName || !scope.defaultConcept) {
                        searchWithGivenConcept(request, response, scope, attrs);
                    } else {
                        searchWithDefaultConcept(request, response, scope);
                    }
                },
                select: function (event, ui) {
                    scope.$apply(function (scope) {
                        ngModelCtrl.$setViewValue(ui.item);
                        if (scope.blurOnSelect) {
                            element.blur();
                        }
                        previousValue = ui.item.value;
                        validator(previousValue);
                        scope.$eval(attrs.ngChange);
                    });
                    return true;
                },
                search: function (event) {
                    var searchTerm = $.trim(element.val());
                    if (searchTerm.length < minLength) {
                        event.preventDefault();
                    }
                    previousValue = null;
                }
            });

            $(element).on('blur', function () {
                var searchTerm = $.trim(element.val());
                validator(searchTerm);
            });
        };

        return {
            link: link,
            require: 'ngModel',
            scope: {
                defaultConcept: '=',
                conceptSetUuid: '=',
                codedConceptName: '=',
                minLength: '=',
                blurOnSelect: '=',
                strictSelect: '=?'
            }
        }
    };

    angular.module('bahmni.common.uiHelper').directive('conceptAutocomplete', conceptAutocomplete);
})();
