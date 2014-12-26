angular.module('bahmni.common.uiHelper')
    .directive('datetimepicker', function () {
        var link = function ($scope) {
            $scope.selectedTime = "00:00";
            $scope.updateModel = function() {
                if($scope.selectedDate != null) {
                    $scope.model = $scope.selectedDate + ($scope.selectedTime != null ? " " + $scope.selectedTime : "");
                }
            }

            if($scope.model != null) {
                var date = moment($scope.model, "MMMM DD, YYYY HH:mm:ss a");
                $scope.selectedDate = date.format("YYYY-MM-DD");
                $scope.selectedTime = date.format("HH:mm");
                $scope.updateModel();
            }

        }

        return {
            restrict: 'E',
            link: link,
            scope: {
                model: '=',
                showTime: '=',
            },
            template: "<span>" +
                "<input type='date' ng-change='updateModel()' ng-model='selectedDate'>" +
                "<input type='time' ng-change='updateModel()' ng-model='selectedTime'>" +
            "</span>"
        }
    });
