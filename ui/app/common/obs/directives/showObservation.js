angular.module('bahmni.common.obs')
    .directive('showObservation', function () {
        
        return {
            restrict: 'E',
            scope: {
                observation: "="
            },
            template: '<ng-include src="\'../common/obs/views/showObservation.html\'" />'
        };
    });
