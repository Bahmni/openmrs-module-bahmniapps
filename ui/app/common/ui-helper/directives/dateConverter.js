'use strict';

angular.module('bahmni.common.uiHelper').directive('dateConverter', [function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelController) {
            var DateUtil = Bahmni.Common.Util.DateUtil;
            ngModelController.$parsers.push(function (date) {
                return DateUtil.parse(date);
            });

            ngModelController.$formatters.push(function (date) {
                return DateUtil.parse(DateUtil.getDateWithoutTime(date));
            });
        }
    };
}]);
