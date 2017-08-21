'use strict';

angular.module('bahmni.ot').controller('moveSurgicalAppointmentController', ['$rootScope', '$scope', '$state', 'ngDialog', 'surgicalAppointmentService', 'surgicalAppointmentHelper', 'surgicalBlockHelper', 'messagingService',
    function ($rootScope, $scope, $state, ngDialog, surgicalAppointmentService, surgicalAppointmentHelper, surgicalBlockHelper, messagingService) {
        var init = function () {
            $scope.surgicalAppointment = $scope.ngDialogData.surgicalAppointment;
            $scope.appointmentDuration = surgicalAppointmentHelper.getEstimatedDurationForAppointment($scope.surgicalAppointment);
        };

        var surgicalBlockMapper = new Bahmni.OT.SurgicalBlockMapper();
        $scope.changeInSurgeryDate = function () {
            if (!$scope.dateForMovingSurgery) {
                $scope.availableSurgicalBlocksForGivenDate = [];
                return;
            }
            var startDateTime = $scope.dateForMovingSurgery;
            var endDateTime = moment($scope.dateForMovingSurgery).endOf("day").toDate();
            surgicalAppointmentService.getSurgicalBlocksInDateRange(startDateTime, endDateTime, false).then(function (response) {
                if (response.data.results.length === 0) {
                    messagingService.showMessage('error', "No free time slots available for this surgeon on the selected date");
                }
                var surgicalBlocksOfThatDate = _.map(response.data.results, function (surgicalBlock) {
                    return surgicalBlockMapper.map(surgicalBlock, $rootScope.attributeTypes, $rootScope.surgeons);
                });
                $scope.availableBlocks = _.filter(surgicalBlocksOfThatDate, function (surgicalBlock) {
                    return surgicalBlockHelper.getAvailableBlockDuration(surgicalBlock) >= $scope.appointmentDuration;
                });
                $scope.availableSurgicalBlocksForGivenDate = _.map($scope.availableBlocks, function (surgicalBlock) {
                    var blockStartTime = Bahmni.Common.Util.DateUtil.formatTime(surgicalBlock.startDatetime);
                    var blockEndTime = Bahmni.Common.Util.DateUtil.formatTime(surgicalBlock.endDatetime);
                    var providerName = surgicalBlock.provider.person.display;
                    var operationTheatre = surgicalBlock.location.name;
                    var surgicalBlockWithDisplayName = {
                        displayName: providerName + ", " + operationTheatre + " (" + blockStartTime + " - " + blockEndTime + ")",
                        uuid: surgicalBlock.uuid,
                        sortWeight: surgicalBlock.surgicalAppointments.length
                    };
                    return surgicalBlockWithDisplayName;
                });
            });
        };

        $scope.cancel = function () {
            ngDialog.close();
        };

        $scope.moveSurgicalAppointment = function () {
            var updatedSurgicalAppointment = {
                uuid: $scope.surgicalAppointment.uuid,
                patient: {uuid: $scope.surgicalAppointment.patient.uuid},
                sortWeight: $scope.destinationBlock.sortWeight,
                surgicalBlock: {uuid: $scope.destinationBlock.uuid}
            };
            surgicalAppointmentService.updateSurgicalAppointment(updatedSurgicalAppointment).then(function (response) {
                messagingService.showMessage('info', "Surgical Appointment moved to the block " + $scope.destinationBlock.displayName + " Successfully");
                ngDialog.close();
                $state.go("otScheduling", { viewDate: $scope.dateForMovingSurgery }, {reload: true});
            });
        };

        init();
    }]);
