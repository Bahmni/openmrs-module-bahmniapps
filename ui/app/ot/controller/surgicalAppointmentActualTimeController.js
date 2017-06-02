'use strict';

angular.module('bahmni.ot').controller('surgicalAppointmentActualTimeController', [
    '$scope', 'ngDialog', 'surgicalAppointmentService', 'messagingService', 'surgicalAppointmentHelper',
    function ($scope, ngDialog, surgicalAppointmentService, messagingService, surgicalAppointmentHelper) {
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
        };

        $scope.add = function () {
            $scope.ngDialogData.surgicalAppointment.actualStartDatetime = $scope.actualStartTime;
            $scope.ngDialogData.surgicalAppointment.actualEndDatetime = $scope.actualEndTime;
            var surgicalAppointment = _.cloneDeep($scope.ngDialogData.surgicalAppointment);
            surgicalAppointment.surgicalBlock = {uuid: $scope.ngDialogData.surgicalBlock.uuid};
            surgicalAppointment.patient = {uuid: surgicalAppointment.patient.uuid};
            surgicalAppointmentService.updateSurgicalAppointment(surgicalAppointment).then(function (response) {
                $scope.ngDialogData.surgicalAppointment = response.data;
                var message = 'Actual time added to ' + surgicalAppointmentHelper.getPatientDisplayLabel($scope.ngDialogData.surgicalAppointment.patient.display) + ' - ' + $scope.ngDialogData.surgicalBlock.location.name;
                messagingService.showMessage('info', message);
                ngDialog.close();
            });
        };

        $scope.close = function () {
            ngDialog.close();
        };
        init();
    }]);
