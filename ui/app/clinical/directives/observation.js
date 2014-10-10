angular.module('bahmni.clinical')
    .directive('observation', function () {
        
        return {
            restrict: 'E',
            scope: {
                observation: "=",
                level: "="
            },
            template: '<ng-include src="\'views/observation.html\'" />'
        };
    });
