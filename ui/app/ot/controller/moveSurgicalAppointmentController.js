'use strict';

angular.module('bahmni.ot').controller('moveSurgicalAppointmentController', ['$rootScope', '$scope', 'ngDialog', 'surgicalAppointmentService', 'surgicalAppointmentHelper', 'surgicalBlockHelper',
    function ($rootScope, $scope, ngDialog, surgicalAppointmentService, surgicalAppointmentHelper, surgicalBlockHelper) {
        var init = function () {
            $scope.surgicalBlock = $scope.ngDialogData.surgicalBlock;
            $scope.surgicalAppointment = $scope.ngDialogData.surgicalAppointment;
            $scope.appointmentDuration = surgicalAppointmentHelper.getEstimatedDurationForAppointment($scope.surgicalAppointment);
        };

        var surgicalBlockMapper = new Bahmni.OT.SurgicalBlockMapper();
        $scope.changeInSurgeryDate = function () {
            var startDateTime = $scope.dateForMovingSurgery;
            var endDateTime = moment($scope.dateForMovingSurgery).endOf("day").toDate();
            surgicalAppointmentService.getSurgicalBlocksInDateRange(startDateTime, endDateTime, false).then(function (response) {
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
                    return providerName + " ( #" + operationTheatre + " " + blockStartTime + " - " + blockEndTime + ")";
                });
            });
        };

        $scope.cancel = function () {
            ngDialog.close();
        };
        init();
    }]);
