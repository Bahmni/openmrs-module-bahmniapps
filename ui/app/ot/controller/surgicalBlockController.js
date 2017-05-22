'use strict';

angular.module('bahmni.ot')
    .controller('surgicalBlockController', ['$scope', '$q', '$state', 'spinner', 'surgicalAppointmentService', 'locationService', 'appService', 'messagingService', 'surgicalAppointmentHelper', 'ngDialog',
        function ($scope, $q, $state, spinner, surgicalAppointmentService, locationService, appService, messagingService, surgicalAppointmentHelper, ngDialog) {
            var init = function () {
                $scope.surgicalForm = {
                    surgicalAppointments: []
                };
                $scope.availableBlockDuration = getAvailableBlockDuration();
                var providerUuids = appService.getAppDescriptor().getConfigValue("primarySurgeonsForOT");
                return $q.all([surgicalAppointmentService.getSurgeons(), locationService.getAllByTag("Operation Theater")]).then(function (response) {
                    $scope.surgeons = surgicalAppointmentHelper.filterProvidersByUuid(providerUuids, response[0].data.results);
                    $scope.locations = response[1].data.results;
                    return response;
                });
            };

            var getAvailableBlockDuration = function () {
                var blockDuration = Bahmni.Common.Util.DateUtil.diffInMinutes($scope.surgicalForm.startDatetime, $scope.surgicalForm.endDatetime);
                var appointmentsDuration = _.sumBy($scope.surgicalForm.surgicalAppointments, function (appointment) {
                    return appointment.duration;
                });
                return blockDuration - appointmentsDuration;
            };

            $scope.isFormValid = function () {
                return $scope.createSurgicalBlockForm.$valid && $scope.isStartDatetimeBeforeEndDatetime($scope.surgicalForm.startDatetime, $scope.surgicalForm.endDatetime);
            };

            $scope.isStartDatetimeBeforeEndDatetime = function (startDate, endDate) {
                if (startDate && endDate) {
                    return startDate < endDate;
                }
                return true;
            };

            $scope.save = function (surgicalForm) {
                if (!$scope.isFormValid()) {
                    messagingService.showMessage('error', "{{'OT_ENTER_MANDATORY_FIELDS' | translate}}");
                    return;
                }
                if (getAvailableBlockDuration() < 0) {
                    messagingService.showMessage('error', "{{'OT_SURGICAL_APPOINTMENT_EXCEEDS_BLOCK_DURATION' | translate}}");
                    return;
                }

                var surgicalBlock = new Bahmni.OT.SurgicalBlockMapper().mapSurgicalBlockUIToDomain(surgicalForm);
                spinner.forPromise(surgicalAppointmentService.saveSurgicalBlock(surgicalBlock)).then(function (response) {
                    $scope.surgicalForm.id = response.data.id;
                    messagingService.showMessage('info', "{{'OT_SAVE_SUCCESS_MESSAGE_KEY' | translate}}");
                    $scope.goToHome();
                }).catch(function () {

                });
            };

            $scope.addSurgicalAppointment = function (surgicalAppointment) {
                if (getAvailableBlockDuration() >= surgicalAppointment.duration) {
                    surgicalAppointment.surgicalAppointmentAttributes.otherSurgeon.value =
                        surgicalAppointment.surgicalAppointmentAttributes.otherSurgeon.value && surgicalAppointment.surgicalAppointmentAttributes.otherSurgeon.value.id;
                    $scope.surgicalForm.surgicalAppointments.push(surgicalAppointment);
                    ngDialog.close();
                }
                else {
                    messagingService.showMessage('error', "{{'OT_SURGICAL_APPOINTMENT_EXCEEDS_BLOCK_DURATION' | translate}}");
                }
            };

            $scope.goToHome = function () {
                var options = {};
                options['dashboardCachebuster'] = Math.random();
                $state.go("home", options);
            };

            $scope.addNewSurgicalAppointment = function (surgicalAppointment) {
                ngDialog.open({
                    template: "views/surgicalAppointment.html",
                    controller: "NewSurgicalAppointmentController",
                    closeByDocument: false,
                    className: 'ngdialog-theme-default surgical-appointment-dialog',
                    showClose: true,
                    scope: $scope,
                    data: surgicalAppointment
                });
            };
            spinner.forPromise(init());
        }]);
