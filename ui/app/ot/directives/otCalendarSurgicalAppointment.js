'use strict';

angular.module('bahmni.ot')
    .directive('otCalendarSurgicalAppointment', ['surgicalAppointmentHelper', function (surgicalAppointmentHelper) {
        var link = function ($scope) {
            $scope.attributes = _.reduce($scope.surgicalAppointment.surgicalAppointmentAttributes, function (attributes, attribute) {
                attributes[attribute.surgicalAppointmentAttributeType.name] = attribute.value;
                return attributes;
            }, {});

            var hasAppointmentStatusInFilteredStatusList = function () {
                if (_.isEmpty($scope.filterParams.statusList)) {
                    return true;
                }
                return _.find($scope.filterParams.statusList, function (selectedStatus) {
                    return selectedStatus.name === $scope.surgicalAppointment.status;
                });
            };

            var hasAppointmentIsOfTheFilteredPatient = function () {
                if (_.isEmpty($scope.filterParams.patient)) {
                    return true;
                }
                return $scope.surgicalAppointment.patient.uuid === $scope.filterParams.patient.uuid;
            };

            $scope.canTheSurgicalAppointmentBeShown = function () {
                return hasAppointmentIsOfTheFilteredPatient() && hasAppointmentStatusInFilteredStatusList();
            };

            var getDataForSurgicalAppointment = function () {
                $scope.height = getHeightForSurgicalAppointment();
                $scope.patient = surgicalAppointmentHelper.getPatientDisplayLabel($scope.surgicalAppointment.patient.display);
            };

            var getHeightForSurgicalAppointment = function () {
                return $scope.surgicalAppointment.derivedAttributes.duration * $scope.heightPerMin;
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
                backgroundColor: "=",
                filterParams: "="

            },
            templateUrl: "../ot/views/calendarSurgicalAppointment.html"
        };
    }]);
