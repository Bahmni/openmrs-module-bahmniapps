'use strict';

angular.module('bahmni.ot').controller('calenderViewCancelAppointmentController', [
    '$scope', 'ngDialog', 'surgicalAppointmentService', 'messagingService', 'surgicalAppointmentHelper',
    function ($scope, ngDialog, surgicalAppointmentService, messagingService, surgicalAppointmentHelper) {
        var surgicalAppointment = $scope.ngDialogData.surgicalAppointment;
        var attributes = surgicalAppointmentHelper.getAppointmentAttributes(surgicalAppointment);
        $scope.appointment = {
            estTimeHours: attributes.estTimeHours,
            estTimeMinutes: attributes.estTimeMinutes,
            patient: surgicalAppointmentHelper.getPatientDisplayLabel(surgicalAppointment.patient.display),
            notes: surgicalAppointment.notes,
            status: surgicalAppointment.status
        };
        
        $scope.confirmCancelAppointment = function () {
            surgicalAppointment.notes = $scope.appointment.notes;
            surgicalAppointment.status = $scope.appointment.status;
            surgicalAppointment.surgicalBlock = {uuid: $scope.ngDialogData.surgicalBlock.uuid};
            surgicalAppointment.patient = {uuid: surgicalAppointment.patient.uuid};
            surgicalAppointment.sortWeight = null;
            surgicalAppointmentService.updateSurgicalAppointment(surgicalAppointment).then(function (response) {
                surgicalAppointment.patient = response.data.patient;
                var message = 'Cancelled appointment for ' + surgicalAppointmentHelper.getPatientDisplayLabel($scope.ngDialogData.surgicalAppointment.patient.display) + ' - ' + $scope.ngDialogData.surgicalBlock.location.name;
                messagingService.showMessage('info', message);
                ngDialog.close();
            });
        };

        $scope.closeDialog = function () {
            surgicalAppointment.sortWeight = null;
            ngDialog.close();
        };
        
    }]);