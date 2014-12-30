angular.module('bahmni.clinical')
.directive('myAutocomplete', function ($parse) {
    return function (scope, element, attrs) {
        var ngModel = $parse(attrs.ngModel);
        element.autocomplete({
            autofocus: true,
            minLength: 2,
            source: function (request, response) {
                var args = angular.fromJson(attrs.myAutocomplete);
                scope[args.src](request.term).success(function (data) {
                    var results = scope[args.responseHandler](data);
                    response(results);
                });
            },
            select: function (event, ui) {
                var args = angular.fromJson(attrs.myAutocomplete);
                scope.$apply(function () {
                    ngModel.assign(scope, ui.item.value);
                    if (args.onSelect != null && scope[args.onSelect] != null) {
                        scope[args.onSelect](args.index, ui.item.lookup);
                    }
                    scope.$eval(attrs.ngChange);
                });
                return true;
            },
            search: function (event) {
                var searchTerm = $.trim(element.val());
                if (searchTerm.length < 2) {
                    event.preventDefault();
                }
            }
        });
    }
});