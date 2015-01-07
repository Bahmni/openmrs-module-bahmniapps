angular.module('bahmni.common.uiHelper')
    .directive('datetimepicker', function () {
        var link = function ($scope) {
            var getSelectedDateStr = function() {
                return $scope.selectedDate != null ? moment($scope.selectedDate).format("YYYY-MM-DD"): "";
            }

            var getSelectedTimeStr = function() {
                return $scope.selectedTime != null ? moment($scope.selectedTime).format("HH:mm") : "";
            }

            $scope.updateModel = function() {
                $scope.model =  getSelectedDateStr() + " " + getSelectedTimeStr();
            }

            $scope.isValid = function() {
                return ($scope.selectedDate == null && $scope.selectedTime == null) || ($scope.selectedDate != null && $scope.selectedTime != null);
            }

            if($scope.model != null) {
                var date = Bahmni.Common.Util.DateUtil.parseDatetime($scope.model);
                $scope.selectedDate = date.toDate();
                $scope.selectedTime = date.toDate();
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
                "<input type='date' ng-change='updateModel()' ng-model='selectedDate' ng-required='!isValid()'>" +
                "<input type='time' ng-change='updateModel()' ng-model='selectedTime' ng-required='!isValid()'>" +
            "</span>"
        }
    });
