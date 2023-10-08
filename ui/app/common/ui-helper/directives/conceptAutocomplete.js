(function () {
    'use strict';

    var constructSearchResult = function (concept, searchString) {
        var matchingName = null;
        var conceptName = concept.name;
        if (!_.includes(_.toLower(conceptName), _.toLower(searchString))) {
            var synonyms = _.map(concept.names, 'name');
            matchingName = _.find(synonyms, function (name) {
                return (name !== conceptName) && name.search(new RegExp(searchString, "i")) !== -1;
            });
        }
        return {
            label: matchingName ? matchingName + " => " + conceptName : conceptName,
            value: conceptName,
            concept: concept,
            uuid: concept.uuid,
            name: conceptName
        };
    };

    var searchWithDefaultConcept = function (searchMethod, request, response) {
        var searchTerm = _.toLower(request.term.trim());
        var searchString = searchTerm.split(" ");
        var isMatching = function (answer) {
            var nestedConceptNameFound = _.find(answer.names, function (name) {
                return _.includes(_.toLower(name.name), searchTerm);
            });
            var flag = true, conceptNameFound;
            searchString.forEach(function (string) {
                conceptNameFound = _.includes(_.toLower(answer.name), string);
                flag = (flag && conceptNameFound);
            });
            return nestedConceptNameFound || (conceptNameFound && flag);
        };
        var responseMap = _.partial(constructSearchResult, _, searchTerm);

        searchMethod()
            .then(_.partial(_.filter, _, isMatching))// == .then(function(value){return _.filter(value,isMatching);})
            .then(_.partial(_.map, _, responseMap))
            .then(response);
    };

    var searchWithGivenConcept = function (searchMethod, request, response) {
        var searchTerm = request.term.trim();
        var responseMap = _.partial(constructSearchResult, _, searchTerm);
        searchMethod()
            .then(_.partial(_.map, _, responseMap))
            .then(response);
    };

    var toBeInjected = ['$parse', '$http', 'conceptService'];
    var conceptAutocomplete = function ($parse, $http, conceptService) {
        var link = function (scope, element, attrs, ngModelCtrl) {
            var minLength = scope.minLength || 2;
            var previousValue = scope.previousValue;

            var validator = function (searchTerm) {
                if (!scope.strictSelect) {
                    return;
                }
                if (!scope.illegalValue && (_.isEmpty(searchTerm) || searchTerm === previousValue)) {
                    element.removeClass('illegalValue');
                    return;
                }
                element.addClass('illegalValue');
            };

            element.autocomplete({
                autofocus: true,
                minLength: minLength,
                source: function (request, response) {
                    var searchMethod;
                    if (!scope.answersConceptName && scope.defaultConcept) {
                        searchMethod = _.partial(conceptService.getAnswers, scope.defaultConcept);
                        searchWithDefaultConcept(searchMethod, request, response);
                    } else {
                        searchMethod = _.partial(conceptService.getAnswersForConceptName, {
                            term: request.term,
                            answersConceptName: scope.answersConceptName
                        });
                        searchWithGivenConcept(searchMethod, request, response);
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

            var blurHandler = function () {
                var searchTerm = $.trim(element.val());
                validator(searchTerm);
            };

            element.on('blur', blurHandler);

            scope.$on("$destroy", function () {
                element.off('blur', blurHandler);
            });
        };

        return {
            link: link,
            require: 'ngModel',
            scope: {
                illegalValue: '=',
                defaultConcept: '=',
                answersConceptName: '=',
                minLength: '=',
                blurOnSelect: '=',
                strictSelect: '=?',
                previousValue: '='
            }
        };
    };

    conceptAutocomplete.$inject = toBeInjected;
    angular.module('bahmni.common.uiHelper').directive('conceptAutocomplete', conceptAutocomplete);
})();
