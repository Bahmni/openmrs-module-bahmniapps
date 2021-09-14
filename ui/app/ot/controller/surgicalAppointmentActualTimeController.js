'use strict';

angular.module('bahmni.ot').controller('surgicalAppointmentActualTimeController', [
    '$scope', 'ngDialog', 'surgicalAppointmentService', 'messagingService', 'surgicalAppointmentHelper', '$translate',
    function ($scope, ngDialog, surgicalAppointmentService, messagingService, surgicalAppointmentHelper, $translate) {
        var surgicalBlock = $scope.ngDialogData.surgicalBlock;
        var surgicalAppointment = $scope.ngDialogData.surgicalAppointment;

        var calculateActualEndTime = function () {
            var totalAppointmentsDuration = 0;
            var sortedAppointments = _.sortBy(surgicalBlock.surgicalAppointments, 'sortWeight');
            _.find(sortedAppointments, function (appointment) {
                totalAppointmentsDuration += surgicalAppointmentHelper.getEstimatedDurationForAppointment(appointment);
                return appointment.id === surgicalAppointment.id;
            });
            var appointmentEndTime = moment(surgicalBlock.startDatetime).toDate();
            appointmentEndTime = Bahmni.Common.Util.DateUtil.addMinutes(appointmentEndTime, totalAppointmentsDuration);
            return appointmentEndTime;
        };

        var init = function () {
            var calculatedAppointmentEndTime = calculateActualEndTime();
            var appointmentDuration = surgicalAppointmentHelper.getEstimatedDurationForAppointment(surgicalAppointment);
            $scope.actualStartTime = (surgicalAppointment.actualStartDatetime && moment(surgicalAppointment.actualStartDatetime).toDate()) ||
                Bahmni.Common.Util.DateUtil.subtractSeconds(calculatedAppointmentEndTime, appointmentDuration * 60);
            $scope.actualEndTime = (surgicalAppointment.actualEndDatetime && moment(surgicalAppointment.actualEndDatetime).toDate())
                || calculatedAppointmentEndTime;
            $scope.notes = surgicalAppointment.notes;
            $scope.patientDisplayLabel = surgicalAppointmentHelper.getPatientDisplayLabel(surgicalAppointment.patient.display);
        };

        $scope.isStartDatetimeBeforeEndDatetime = function (startDate, endDate) {
            if (startDate && endDate) {
                return startDate < endDate;
            }
            return true;
        };

        $scope.add = function () {
            if (!$scope.isStartDatetimeBeforeEndDatetime($scope.actualStartTime, $scope.actualEndTime)) {
                messagingService.showMessage('error', 'ACTUAL_START_TIME_GREATER_THAN_END_TIME_MESSAGE');
                return;
            }
            var surgicalAppointment = {};
            surgicalAppointment.id = $scope.ngDialogData.surgicalAppointment.id;
            surgicalAppointment.uuid = $scope.ngDialogData.surgicalAppointment.uuid;
            surgicalAppointment.actualStartDatetime = $scope.actualStartTime;
            surgicalAppointment.actualEndDatetime = $scope.actualEndTime;
            surgicalAppointment.status = $scope.actualStartTime && Bahmni.OT.Constants.completed || Bahmni.OT.Constants.scheduled;
            surgicalAppointment.notes = $scope.notes;
            surgicalAppointment.surgicalBlock = {uuid: $scope.ngDialogData.surgicalBlock.uuid};
            surgicalAppointment.patient = {uuid: $scope.ngDialogData.surgicalAppointment.patient.uuid};
            surgicalAppointment.sortWeight = $scope.ngDialogData.surgicalAppointment.sortWeight;
            surgicalAppointmentService.updateSurgicalAppointment(surgicalAppointment).then(function (response) {
                $scope.ngDialogData.surgicalAppointment.actualStartDatetime = response.data.actualStartDatetime;
                $scope.ngDialogData.surgicalAppointment.actualEndDatetime = response.data.actualEndDatetime;
                $scope.ngDialogData.surgicalAppointment.status = response.data.status;
                $scope.ngDialogData.surgicalAppointment.notes = response.data.notes;
                var message = $translate.instant('ACTUAL_TIME_ADDED_TO_KEY') + surgicalAppointmentHelper.getPatientDisplayLabel($scope.ngDialogData.surgicalAppointment.patient.display) + ' - ' + $scope.ngDialogData.surgicalBlock.location.name;
                messagingService.showMessage('info', message);
                ngDialog.close();
            });
        };

        $scope.isActualTimeRequired = function () {
            return $scope.actualStartTime || $scope.actualEndTime || $scope.notes;
        };

        $scope.close = function () {
            ngDialog.close();
        };
        init();
    }]);
