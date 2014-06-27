angular.module('bahmni.common.uiHelper')
.directive('conceptAutocomplete', function ($parse, $http) {
    var link = function (scope, element, attrs, ngModelCtrl) {
        var source =  function(request) {
            return $http.get(Bahmni.Common.Constants.conceptUrl, { params: {q: request.term, memberOf: scope.conceptSetUuid, answerTo: scope.codedConceptName, v: "custom:(uuid,name)"}});
        };
        var minLength = scope.minLength || 2;

        element.autocomplete({
            autofocus: true,
            minLength: minLength,
            source: function (request, response) {
                source({elementId: attrs.id, term: request.term, elementType: attrs.type}).then(function (resp) {
                    var results = resp.data.results.map(function (concept) {
                        //todo : get rid of either 'value' or 'name' fields
                        return {'value': concept.name.name, 'concept': concept, uuid: concept.uuid,name:concept.name.name };
                    });
                    response(results);
                });
            },
            select: function (event, ui) {
                scope.$apply(function (scope) {
                    ngModelCtrl.$setViewValue(ui.item);
                    scope.$eval(attrs.ngChange);
                    if(scope.blurOnSelect) element.blur();
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
            blurOnSelect: '='
        }
    }
});