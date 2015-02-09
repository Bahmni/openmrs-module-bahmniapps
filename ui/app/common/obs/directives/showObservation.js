angular.module('bahmni.common.obs')
    .directive('showObservation', function () {
        var controller = function ($scope, $filter) {
            $scope.toggle = function (observation) {
                observation.showDetails = !observation.showDetails
            };

            $scope.dateString = function (observation) {
                var dateFormat = "";
                if ($scope.showDate && $scope.showTime) {
                    dateFormat = 'dd MMM yy hh:mm a';
                }
                else if (!$scope.showDate && ($scope.showTime || $scope.showTime === undefined)) {
                    dateFormat = "hh:mm a";
                }
                else{
                    return null;
                }
                return $filter('date')(observation.observationDateTime, dateFormat);
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
