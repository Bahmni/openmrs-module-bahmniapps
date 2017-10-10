'use strict';

angular.module('bahmni.ot').controller('calendarViewCancelAppointmentController', [
    '$scope', '$translate', 'ngDialog', 'surgicalAppointmentService', 'messagingService', 'surgicalAppointmentHelper',
    function ($scope, $translate, ngDialog, surgicalAppointmentService, messagingService, surgicalAppointmentHelper) {
        var ngDialogSurgicalAppointment = $scope.ngDialogData.surgicalAppointment;
        var attributes = surgicalAppointmentHelper.getAppointmentAttributes(ngDialogSurgicalAppointment);
        $scope.appointment = {
            estTimeHours: attributes.estTimeHours,
            estTimeMinutes: attributes.estTimeMinutes,
            patient: surgicalAppointmentHelper.getPatientDisplayLabel(ngDialogSurgicalAppointment.patient.display),
            notes: ngDialogSurgicalAppointment.notes,
            status: ngDialogSurgicalAppointment.status
        };

        $scope.confirmCancelAppointment = function () {
            var surgicalAppointment = {};
            surgicalAppointment.id = $scope.ngDialogData.surgicalAppointment.id;
            surgicalAppointment.uuid = $scope.ngDialogData.surgicalAppointment.uuid;
            surgicalAppointment.notes = $scope.appointment.notes;
            surgicalAppointment.status = $scope.appointment.status;
            surgicalAppointment.surgicalBlock = {uuid: $scope.ngDialogData.surgicalBlock.uuid};
            surgicalAppointment.patient = {uuid: ngDialogSurgicalAppointment.patient.uuid};
            surgicalAppointment.sortWeight = null;
            surgicalAppointmentService.updateSurgicalAppointment(surgicalAppointment).then(function (response) {
                ngDialogSurgicalAppointment.patient = response.data.patient;
                ngDialogSurgicalAppointment.status = response.data.status;
                ngDialogSurgicalAppointment.notes = response.data.notes;
                ngDialogSurgicalAppointment.sortWeight = response.data.sortWeight;
                var message = '';
                if (ngDialogSurgicalAppointment.status === Bahmni.OT.Constants.postponed) {
                    message = $translate.instant("OT_SURGICAL_APPOINTMENT_POSTPONED_MESSAGE");
                } else if (ngDialogSurgicalAppointment.status === Bahmni.OT.Constants.cancelled) {
                    message = $translate.instant("OT_SURGICAL_APPOINTMENT_CANCELLED_MESSAGE");
                }
                message = message + surgicalAppointmentHelper.getPatientDisplayLabel($scope.ngDialogData.surgicalAppointment.patient.display) + ' - ' + $scope.ngDialogData.surgicalBlock.location.name;
                messagingService.showMessage('info', message);
                ngDialog.close();
            });
        };

        $scope.closeDialog = function () {
            ngDialog.close();
        };
    }]);
