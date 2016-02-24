'use strict';

angular.module('bahmni.common.uiHelper')
.directive('conceptAutocomplete', function ($parse, $http) {
    var link = function (scope, element, attrs, ngModelCtrl) {
        var responseMap = scope.responseMap();
        var source =  function(request) {
            var params = {q: request.term, memberOf: scope.conceptSetUuid, answerTo: scope.codedConceptName, v: "custom:(uuid,name,names:(name))"};
            if(params.answerTo){
                params.question=params.answerTo;
                params.s="byQuestion";
            }
            return $http.get(Bahmni.Common.Constants.conceptUrl, { params: params});
        };
        var minLength = scope.minLength || 2;

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
                    scope.$eval(attrs.ngChange);
                    if(scope.blurOnSelect) {
                        element.blur();
                    }
                });
                return true;
            },
            search: function (event) {
                var searchTerm = $.trim(element.val());
                if (searchTerm.length < minLength) {
                    event.preventDefault();
                }
            }
        });
        
    }
    return {
        link: link,
        require: 'ngModel',
        scope: {
            conceptSetUuid: '=',
            codedConceptName: '=',
            minLength: '=',
            blurOnSelect: '=',
            responseMap: '&'
        }
    }
});