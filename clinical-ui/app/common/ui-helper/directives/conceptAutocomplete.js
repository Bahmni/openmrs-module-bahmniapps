angular.module('bahmni.common.uiHelper')
.directive('conceptAutocomplete', function ($parse) {
    var link = function (scope, element, attrs, ngModelCtrl) {
        var source = scope.source();
        var minLength = scope.minLength || 2;

        scope.$watch('concept', function(){
            var concept = scope.concept;
            element.val(concept ? concept.name : "");
        });

        element.autocomplete({
            autofocus: true,
            minLength: minLength,
            source: function (request, response) {
                source({elementId: attrs.id, term: request.term, elementType: attrs.type}).then(function (resp) {
                    var results = resp.data.map(function (concept) {
                        return {'value': concept.name, 'concept': concept };
                    });
                    response(results);
                });
            },
            select: function (event, ui) {
                scope.$apply(function (scope) {
                    scope.concept = ui.item.concept;
                    element.val(ui.item.value);
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
        scope: {
            source: '&',
            concept: '=',
            minLength: '=',
            blurOnSelect: '='
        }
    }
});