'use strict';

angular.module('bahmni.common.uiHelper').directive('capitalizeField', ['$parse', function ($parse) {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelController) {
            var capitalize = function (inputValue) {
                if (!inputValue) {
                    inputValue = '';
                }
                var capitalized = inputValue.charAt(0).toUpperCase() + inputValue.substring(1);
                if (capitalized !== inputValue) {
                    ngModelController.$setViewValue(capitalized);
                    ngModelController.$render();
                }
                return capitalized;
            };
            ngModelController.$parsers.push(capitalize);
            capitalize($parse(attrs.ngModel)(scope));
        }
    };
}]);
