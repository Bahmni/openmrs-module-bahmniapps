'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('conceptAutocomplete', function ($parse, $http) {
        var link = function (scope, element, attrs, ngModelCtrl) {
            var responseMap = scope.responseMap();
            var source = function (request) {
                var params = {
                    q: request.term,
                    memberOf: scope.conceptSetUuid,
                    answerTo: scope.codedConceptName,
                    v: "custom:(uuid,name,names:(name))"
                };
                if (params.answerTo) {
                    params.question = params.answerTo;
                    params.s = "byQuestion";
                }
                return $http.get(Bahmni.Common.Constants.conceptUrl, {params: params});
            };
            var minLength = scope.minLength || 2;
            var previousValue;

            var validator = function (searchTerm) {
                if (!scope.strictSelect) {
                    return;
                }
                if (_.isEmpty(searchTerm) || searchTerm === previousValue) {
                    element.removeClass('illegalValue');
                    return;
                }
                element.addClass('illegalValue');
            };

            element.autocomplete({
                autofocus: true,
                minLength: minLength,
                source: function (request, response) {
                    source({elementId: attrs.id, term: request.term, elementType: attrs.type}).then(function (resp) {
                        var results = resp.data.results.map(function (concept) {
                            return responseMap ? responseMap(concept, request.term.trim()) : concept;
                        });
                        response(results);
                    });
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
                conceptSetUuid: '=',
                codedConceptName: '=',
                minLength: '=',
                blurOnSelect: '=',
                responseMap: '&',
                strictSelect: '=?'
            }
        }
    });