'use strict';

angular.module('bahmni.ot').controller('surgicalBlockViewCancelAppointmentController', ['$scope', 'ngDialog', 'surgicalAppointmentHelper',
    function ($scope, ngDialog, surgicalAppointmentHelper) {
        var surgicalAppointment = $scope.ngDialogData.surgicalAppointment;
        $scope.appointment = {
            estTimeHours: surgicalAppointment.surgicalAppointmentAttributes.estTimeHours.value,
            estTimeMinutes: surgicalAppointment.surgicalAppointmentAttributes.estTimeMinutes.value,
            patient: surgicalAppointment.patient.label || surgicalAppointmentHelper.getPatientDisplayLabel(surgicalAppointment.patient.display),
            notes: surgicalAppointment.notes,
            status: surgicalAppointment.status
        };

        $scope.confirmCancelAppointment = function () {
            var actualAppointment = _.find($scope.ngDialogData.surgicalForm.surgicalAppointments, function (appointment) {
                return appointment.isBeingEdited;
            });
            if (actualAppointment.id == null) {
                _.remove($scope.ngDialogData.surgicalForm.surgicalAppointments, actualAppointment);
                ngDialog.close();
            }
            actualAppointment.status = $scope.appointment.status;
            actualAppointment.notes = $scope.appointment.notes;
            actualAppointment.sortWeight = null;
            delete actualAppointment.isBeingEdited;
            $scope.ngDialogData.updateAvailableBlockDurationFn();
            ngDialog.close();
        };

        $scope.closeDialog = function () {
            var actualAppointment = _.find($scope.ngDialogData.surgicalForm.surgicalAppointments, function (appointment) {
                return appointment.isBeingEdited;
            });
            delete actualAppointment.isBeingEdited;
            ngDialog.close();
        };
    }]);
