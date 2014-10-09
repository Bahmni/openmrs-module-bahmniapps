angular.module('bahmni.clinical')
    .directive('observation', function () {

        var controller = function ($scope) {
            $scope.level++;
        };
        return {
            restrict: 'E',
            controller: controller,
            scope: {
                observation: "=",
                level: "="
            },
            template: '<ng-include src="\'views/observation.html\'" />'
        };
    });
