'use strict';

angular.module('bahmni.ot').controller('calendarViewCancelAppointmentController', [
    '$scope', '$translate', '$q', 'ngDialog', 'surgicalAppointmentService', 'messagingService', 'surgicalAppointmentHelper',
    function ($scope, $translate, $q, ngDialog, surgicalAppointmentService, messagingService, surgicalAppointmentHelper) {
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
            $q.all([surgicalAppointmentService.updateSurgicalAppointment(surgicalAppointment), updateSortWeightOfSurgicalAppointments()]).then(function (response) {
                ngDialogSurgicalAppointment.patient = response[0].data.patient;
                ngDialogSurgicalAppointment.status = response[0].data.status;
                ngDialogSurgicalAppointment.notes = response[0].data.notes;
                ngDialogSurgicalAppointment.sortWeight = response[0].data.sortWeight;
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

        var updateSortWeightOfSurgicalAppointments = function () {
            var surgicalBlock = _.cloneDeep($scope.ngDialogData.surgicalBlock);
            var surgicalAppointments = _.filter(surgicalBlock.surgicalAppointments, function (appointment) {
                return appointment.uuid !== $scope.ngDialogData.surgicalAppointment.uuid && appointment.status !== 'POSTPONED' && appointment.status !== 'CANCELLED';
            });
            surgicalBlock.surgicalAppointments = _.map(surgicalAppointments, function (appointment, index) {
                appointment.sortWeight = index;
                return appointment;
            });
            surgicalBlock.provider = {uuid: surgicalBlock.provider.uuid};
            surgicalBlock.location = {uuid: surgicalBlock.location.uuid};
            surgicalBlock.surgicalAppointments = _.map(surgicalBlock.surgicalAppointments, function (appointment) {
                appointment.patient = {uuid: appointment.patient.uuid};
                appointment.surgicalAppointmentAttributes = _.values(appointment.surgicalAppointmentAttributes).filter(function (attribute) {
                    return !_.isUndefined(attribute.value);
                });
                return _.omit(appointment, ['derivedAttributes', 'surgicalBlock', 'bedNumber', 'bedLocation']);
            });

            return surgicalAppointmentService.updateSurgicalBlock(surgicalBlock);
        };

        $scope.closeDialog = function () {
            ngDialog.close();
        };
    }]);
