'use strict';

angular.module('bahmni.common.uiHelper')
.directive('bahmniAutocomplete', ['$translate', function ($translate) {
    var link = function (scope, element, attrs, ngModelCtrl) {
        var source = scope.source();
        var responseMap = scope.responseMap && scope.responseMap();
        var onSelect = scope.onSelect();
        var onEdit = scope.onEdit && scope.onEdit();
        var minLength = scope.minLength || 2;
        var formElement = element[0];
        var validationMessage = scope.validationMessage || $translate.instant("SELECT_VALUE_FROM_AUTOCOMPLETE_DEFAULT_MESSAGE");

        var validateIfNeeded = function (value) {
            if (!scope.strictSelect) {
                return;
            }
            scope.isInvalid = (value !== scope.selectedValue);
            if (_.isEmpty(value)) {
                scope.isInvalid = false;
            }
        };

        scope.$watch('initialValue', function () {
            if (scope.initialValue) {
                scope.selectedValue = scope.initialValue;
                scope.isInvalid = false;
            }
        });

        element.autocomplete({
            autofocus: true,
            minLength: minLength,
            source: function (request, response) {
                source({elementId: attrs.id, term: request.term, elementType: attrs.type}).then(function (data) {
                    var results = responseMap ? responseMap(data) : data;
                    response(results);
                });
            },
            select: function (event, ui) {
                scope.selectedValue = ui.item.value;
                ngModelCtrl.$setViewValue(ui.item.value);
                if (onSelect != null) {
                    onSelect(ui.item);
                }
                validateIfNeeded(ui.item.value);
                if (scope.blurOnSelect) {
                    element.blur();
                }
                scope.$apply();
                scope.$eval(attrs.ngDisabled);
                scope.$apply();
                return true;
            },
            search: function (event, ui) {
                if (onEdit != null) {
                    onEdit(ui.item);
                }
                var searchTerm = $.trim(element.val());
                validateIfNeeded(searchTerm);
                if (searchTerm.length < minLength) {
                    event.preventDefault();
                }
            }
        });
        var changeHanlder = function (e) {
            validateIfNeeded(element.val());
        };

        var keyUpHandler = function (e) {
            validateIfNeeded(element.val());
            scope.$apply();
        };

        element.on('change', changeHanlder);
        element.on('keyup', keyUpHandler);

        scope.$watch('isInvalid', function () {
            ngModelCtrl.$setValidity('selection', !scope.isInvalid);
            formElement.setCustomValidity(scope.isInvalid ? validationMessage : '');
        });

        scope.$on("$destroy", function () {
            element.off('change', changeHanlder);
            element.off('keyup', keyUpHandler);
        });
    };

    return {
        link: link,
        require: 'ngModel',
        scope: {
            source: '&',
            responseMap: '&?',
            onSelect: '&',
            onEdit: '&?',
            minLength: '=?',
            blurOnSelect: '=?',
            strictSelect: '=?',
            validationMessage: '@',
            isInvalid: "=?",
            initialValue: "=?"
        }
    };
}]);
