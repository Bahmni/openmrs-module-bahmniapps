angular.module('bahmni.common.obs')
    .directive('showObservation', function () {
        var controller = function($scope){
            $scope.toggle = function(observation) {
                observation.showDetails = !observation.showDetails
            };
        };
        return {
            restrict: 'E',
            scope: {
                observation: "=",
                patient: "=",
                showDate: "@",
                showDetailsButton: "="
            },
            controller: controller,
            template: '<ng-include src="\'../common/obs/views/showObservation.html\'" />'
        };
    });
