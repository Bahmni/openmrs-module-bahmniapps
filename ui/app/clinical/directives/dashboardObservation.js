angular.module('bahmni.clinical')
    .directive('dashboardObservation', function () {
        
        return {
            restrict: 'E',
            scope: {
                observation: "=",
                level: "="
            },
            template: '<ng-include src="\'views/dashboardObservation.html\'" />'
        };
    });
