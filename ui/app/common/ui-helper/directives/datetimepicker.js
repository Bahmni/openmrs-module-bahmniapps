angular.module('bahmni.common.uiHelper')
    .directive('datetimepicker', function () {
        var link = function ($scope) {
            var getSelectedDateStr = function() {
                return $scope.selectedDate != null ? moment($scope.selectedDate).format("YYYY-MM-DD"): "";
            };

            var getSelectedTimeStr = function() {
                return $scope.selectedTime != null ? moment($scope.selectedTime).format("HH:mm") : "";
            };

            var valueNotFilled = function() {
                return $scope.selectedDate == null && $scope.selectedTime == null;
            };

            var valueCompletelyFilled = function() {
                return ($scope.selectedDate != null && $scope.selectedTime != null);
            };

            $scope.updateModel = function() {
                if (valueCompletelyFilled()) {
                    $scope.model =  getSelectedDateStr() + " " + getSelectedTimeStr();
                }else{
                    $scope.model = "Invalid DateTime";
                }
            };

            $scope.isValid = function() {
                return valueNotFilled() || valueCompletelyFilled();
            };

            if($scope.model != null) {
                var date = moment($scope.model, "MMMM DD, YYYY HH:mm:ss a").toDate();
                $scope.selectedDate = date;
                $scope.selectedTime = date;
                $scope.updateModel();
            }
        };

        return {
            restrict: 'E',
            link: link,
            scope: {
                model: '=',
                showTime: '=',
                illegalValue: '='
            },
            template:
                "<span>" +
                    "<input type='date' ng-change='updateModel()' ng-model='selectedDate' ng-required='!isValid() || illegalValue'>" +
                    "<input type='time' ng-change='updateModel()' ng-model='selectedTime' ng-required='!isValid() || illegalValue'>" +
                "</span>"
        }
    });
