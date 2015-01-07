angular.module('bahmni.common.uiHelper')
    .directive('datetimepicker', function () {
        var link = function ($scope) {
            $scope.selectedTime = moment("00:00", "HH:mm").toDate();
            var getSelectedDateStr = function() {
                return moment($scope.selectedDate).format("YYYY-MM-DD");
            }

            var getSelectedTimeStr = function() {
                return $scope.selectedTime != null ? moment($scope.selectedTime).format("HH:mm") : "";
            }

            $scope.updateModel = function() {
                if($scope.selectedDate != null) {
                    $scope.model =  getSelectedDateStr() + " " + getSelectedTimeStr();
                }
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
                "<input type='date' ng-change='updateModel()' ng-model='selectedDate'>" +
                "<input type='time' ng-change='updateModel()' ng-model='selectedTime'>" +
            "</span>"
        }
    });
