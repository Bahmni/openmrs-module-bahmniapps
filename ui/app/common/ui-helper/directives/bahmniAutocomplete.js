angular.module('bahmni.common.uiHelper')
.directive('bahmniAutocomplete', function ($parse) {
    var link = function (scope, element, attrs, ngModelCtrl) {
        var ngModel = $parse(attrs.ngModel);
        var source = scope.source();
        var responseMap = scope.responseMap();
        var onSelect = scope.onSelect();
        var minLength = scope.minLength || 2;

        element.autocomplete({
            autofocus: true,
            minLength: minLength,
            source: function (request, response) {
                source({elementId: attrs.id, term: request.term, elementType: attrs.type}).then(function (resp) {
                    var data = resp.data;
                    var results = responseMap ? responseMap(data) : data ;
                    response(results);
                });
            },
            select: function (event, ui) {
                if(onSelect != null) {
                    onSelect(ui.item);
                }
                ngModelCtrl.$setViewValue(ui.item.value);
                scope.$apply();
                if(scope.blurOnSelect) element.blur();
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
            source: '&',
            responseMap: '&',
            onSelect: '&',
            minLength: '=',
            blurOnSelect: '='
        }
    }
});