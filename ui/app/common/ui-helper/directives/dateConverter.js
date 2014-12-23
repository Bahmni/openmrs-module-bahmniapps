angular.module('bahmni.common.uiHelper').directive('dateConverter', ['$filter', function($filter) {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModelController) {
            ngModelController.$parsers.push(function(date) {
                return Bahmni.Common.Util.DateUtil.parse(date);
            });

            ngModelController.$formatters.push(function(date) {
                return Bahmni.Common.Util.DateUtil.getDateWithoutTime(date)
            });
        }
    };
}]);