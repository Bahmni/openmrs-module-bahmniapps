angular.module('bahmni.common.obs')
    .directive('showObservation', function () {
        
        return {
            restrict: 'E',
            scope: {
                observation: "=",
                patient: "=",
                showComments:"="
            },
            template: '<ng-include src="\'../common/obs/views/showObservation.html\'" />'
        };
    });
