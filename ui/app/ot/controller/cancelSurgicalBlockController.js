'use strict';

angular.module('bahmni.ot').controller('cancelSurgicalBlockController', [
    '$scope', '$state', '$translate', 'ngDialog', 'surgicalAppointmentService', 'messagingService',
    function ($scope, $state, $translate, ngDialog, surgicalAppointmentService, messagingService) {
        var surgicalBlock = $scope.ngDialogData.surgicalBlock;

        $scope.confirmCancelSurgicalBlock = function () {
            var clonedSurgicalBlock = _.cloneDeep(surgicalBlock);
            _.forEach(clonedSurgicalBlock.surgicalAppointments, function (appointment) {
                if (!appointment.status) {
                    appointment.status = $scope.surgicalBlock.status;
                    appointment.notes = $scope.surgicalBlock.notes;
                }
                appointment.patient = {uuid: appointment.patient.uuid};
            });
            clonedSurgicalBlock.voided = true;
            clonedSurgicalBlock.provider = {uuid: clonedSurgicalBlock.provider.uuid};
            clonedSurgicalBlock.location = {uuid: clonedSurgicalBlock.location.uuid};

            surgicalAppointmentService.saveSurgicalBlock(clonedSurgicalBlock).then(function (response) {
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

        $scope.closeDialog = function () {
            ngDialog.close();
        };
    }]);
