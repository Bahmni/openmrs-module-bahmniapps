'use strict';

angular.module('bahmni.ot')
    .directive('otCalendarSurgicalAppointment', [function () {
        var link = function ($scope) {
            var getDataForSurgicalAppointment = function () {
                $scope.height = getHeightForSurgicalAppointment();
                $scope.patient = $scope.surgicalAppointment.patient.display.split('-')[1] + " ( " +
                    $scope.surgicalAppointment.patient.display.split('-')[0] + " )";
                $scope.procedure = getSurgicalAppointmentAttributeByName("procedure") && getSurgicalAppointmentAttributeByName("procedure").value;
                $scope.otherSurgeon = getSurgicalAppointmentAttributeByName("otherSurgeon") && getSurgicalAppointmentAttributeByName("otherSurgeon").value;
                $scope.anaesthetist = getSurgicalAppointmentAttributeByName("anaesthetist") && getSurgicalAppointmentAttributeByName("anaesthetist").value;
                $scope.notes = $scope.surgicalAppointment.notes;
                $scope.cleaningTimeHeight = getSurgicalAppointmentAttributeByName("cleaningTime") && parseInt(getSurgicalAppointmentAttributeByName("cleaningTime").value) * $scope.heightPerMin;
            };

            var getSurgicalAppointmentAttributeByName = function (name) {
                return _.find($scope.surgicalAppointment.surgicalAppointmentAttributes, function (attribute) {
                    return attribute.surgicalAppointmentAttributeType.name === name;
                });
            };

            var getHeightForSurgicalAppointment = function () {
                var estTimeHours = (getSurgicalAppointmentAttributeByName("estTimeHours") &&
                    getSurgicalAppointmentAttributeByName("estTimeHours").value) || 0;
                var estTimeMinutes = (getSurgicalAppointmentAttributeByName("estTimeMinutes") && getSurgicalAppointmentAttributeByName("estTimeMinutes").value) || 0;
                var cleaningTime = (getSurgicalAppointmentAttributeByName("cleaningTime") && getSurgicalAppointmentAttributeByName("cleaningTime").value) || 0;
                return (
                    estTimeHours * 60 +
                    parseInt(estTimeMinutes) +
                    parseInt(cleaningTime))
                    * $scope.heightPerMin;
            };

            $scope.selectSurgicalAppointment = function ($event) {
                console.log("Inside select");
                $(event.target).focus();
            };

            getDataForSurgicalAppointment();
        };
        return {
            restrict: 'E',
            link: link,
            scope: {
                surgicalAppointment: "=",
                heightPerMin: "="

            },
            templateUrl: "../ot/views/calendarSurgicalAppointment.html"
        };
    }]);
