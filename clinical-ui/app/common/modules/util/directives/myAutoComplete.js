angular.module('bahmni.common.util')
.directive('myAutocomplete', function ($parse) {
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
                source(attrs.id, request.term, attrs.type).success(function (data) {
                    var results = responseMap ? responseMap(data) : data ;
                    response(results);
                });
            },
            select: function (event, ui) {
                scope.$apply(function (scope) {
                    if(onSelect != null) {
                        onSelect(ui.item);
                    }
                    ngModelCtrl.$setViewValue(ui.item.value);
                    scope.$eval(attrs.ngChange);
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
            source: '&',
            responseMap: '&',
            onSelect: '&',
            minLength: '='
        }
    }
});