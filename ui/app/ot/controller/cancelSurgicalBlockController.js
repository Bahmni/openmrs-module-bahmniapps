'use strict';

angular.module('bahmni.ot').controller('cancelSurgicalBlockController', [
    '$scope', '$state', '$translate', 'ngDialog', 'surgicalAppointmentService', 'messagingService',
    function ($scope, $state, $translate, ngDialog, surgicalAppointmentService, messagingService) {
        var surgicalBlock = $scope.ngDialogData.surgicalBlock;

        $scope.confirmCancelSurgicalBlock = function () {
            _.forEach(surgicalBlock.surgicalAppointments, function (appointment) {
                if (!appointment.status) {
                    appointment.status = $scope.surgicalBlock.status;
                    appointment.notes = $scope.surgicalBlock.notes;
                    appointment.sortWeight = null;
                }
                appointment.patient = {uuid: appointment.patient.uuid};
            });
            surgicalBlock.voided = true;
            surgicalBlock.voidReason = $scope.surgicalBlock.notes;
            surgicalBlock.provider = {uuid: surgicalBlock.provider.uuid};
            surgicalBlock.location = {uuid: surgicalBlock.location.uuid};

            surgicalAppointmentService.saveSurgicalBlock(surgicalBlock).then(function (response) {
                var message = '';
                if ($scope.surgicalBlock.status === Bahmni.OT.Constants.postponed) {
                    message = $translate.instant("OT_SURGICAL_BLOCK_POSTPONED_MESSAGE");
                } else if ($scope.surgicalBlock.status === Bahmni.OT.Constants.cancelled) {
                    message = $translate.instant("OT_SURGICAL_BLOCK_CANCELLED_MESSAGE");
                }
                message += response.data.provider.person.display;
                messagingService.showMessage('info', message);
                ngDialog.close();
                var options = {};
                options['dashboardCachebuster'] = Math.random();
                $state.go("home", options);
            });
        };
    }]);
