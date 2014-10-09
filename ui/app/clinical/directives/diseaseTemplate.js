angular.module('bahmni.clinical')
    .directive('diseaseTemplate', function () {

        var controller = function ($scope) {
            $scope.level = 0;
        };

        return {
            restrict: 'E',
            controller: controller,
            scope: {
                diseaseTemplate: "=template"
            },
            templateUrl: "views/diseaseTemplate.html"
        };
    });