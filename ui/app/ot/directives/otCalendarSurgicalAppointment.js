'use strict';

angular.module('bahmni.ot')
    .directive('otCalendarSurgicalAppointment', [function () {
        var link = function ($scope) {
            $scope.attributes = _.reduce($scope.surgicalAppointment.surgicalAppointmentAttributes, function (attributes, attribute) {
                attributes[attribute.surgicalAppointmentAttributeType.name] = attribute.value;
                return attributes;
            }, {});

            var getDataForSurgicalAppointment = function () {
                $scope.height = getHeightForSurgicalAppointment();
                $scope.patient = $scope.surgicalAppointment.patient.display.split('-')[1] + " ( " + $scope.surgicalAppointment.patient.display.split('-')[0] + " )";
            };

            var getHeightForSurgicalAppointment = function () {
                var estTimeHours = $scope.attributes["estTimeHours"] || 0;
                var estTimeMinutes = $scope.attributes["estTimeMinutes"] || 0;
                var cleaningTime = $scope.attributes["cleaningTime"] || 0;
                return (
                    estTimeHours * 60 +
                    parseInt(estTimeMinutes) +
                    parseInt(cleaningTime))
                    * $scope.heightPerMin;
            };

            $scope.selectSurgicalAppointment = function ($event) {
                $scope.$emit("event:surgicalAppointmentSelect", $scope.surgicalAppointment, $scope.$parent.surgicalBlock);
                $event.stopPropagation();
            };
            getDataForSurgicalAppointment();

            $scope.deselectSurgicalAppointment = function ($event) {
                $scope.$emit("event:surgicalBlockDeselect");
                $event.stopPropagation();
            };
        };
        return {
            restrict: 'E',
            link: link,
            scope: {
                surgicalAppointment: "=",
                heightPerMin: "=",
                backgroundColor: "="

            },
            templateUrl: "../ot/views/calendarSurgicalAppointment.html"
        };
    }]);
