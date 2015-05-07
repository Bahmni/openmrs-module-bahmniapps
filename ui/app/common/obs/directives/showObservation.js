angular.module('bahmni.common.obs')
    .directive('showObservation', function () {
        var controller = function ($scope, $rootScope , $filter) {
            $scope.toggle = function (observation) {
                observation.showDetails = !observation.showDetails
            };

            $scope.print = $rootScope.isBeingPrinted || false;

            $scope.showConceptName = function(obs) {
                if (obs.isImageConcept()) {
                    if ($scope.print) {
                        return false;
                    }
                }
                return true;
            };

            $scope.dateString = function (observation) {
                var dateFormat = "";
                var filterName;
                if ($scope.showDate && $scope.showTime) {
                    filterName = 'bahmniDateTime';
                }
                else if (!$scope.showDate && ($scope.showTime || $scope.showTime === undefined)) {
                    filterName = 'bahmniTime';
                }
                else{
                    return null;
                }
                return $filter(filterName)(observation.observationDateTime);
            };
        };
        return {
            restrict: 'E',
            scope: {
                observation: "=",
                patient: "=",
                showDate: "=",
                showTime: "=",
                showDetailsButton: "="
            },
            controller: controller,
            template: '<ng-include src="\'../common/obs/views/showObservation.html\'" />'
        };
    });
