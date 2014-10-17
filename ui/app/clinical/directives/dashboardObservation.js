angular.module('bahmni.clinical')
    .directive('dashboardObservation', function () {
        
        return {
            restrict: 'E',
            scope: {
                observation: "="
            },
            template: '<ng-include src="\'views/dashboardObservation.html\'" />'
        };
    });
