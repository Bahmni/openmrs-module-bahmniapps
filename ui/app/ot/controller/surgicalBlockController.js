'use strict';

angular.module('bahmni.ot')
    .controller('surgicalBlockController', ['$scope', '$q', '$state', '$stateParams', 'spinner', 'surgicalAppointmentService', 'locationService', 'appService', 'messagingService', 'surgicalAppointmentHelper', 'ngDialog',
        function ($scope, $q, $state, $stateParams, spinner, surgicalAppointmentService, locationService, appService, messagingService, surgicalAppointmentHelper, ngDialog) {
            var init = function () {
                $scope.surgicalForm = {
                    surgicalAppointments: []
                };
                var providerUuids = appService.getAppDescriptor().getConfigValue("primarySurgeonsForOT");
                return $q.all([surgicalAppointmentService.getSurgeons(), locationService.getAllByTag("Operation Theater"), surgicalAppointmentService.getSurgicalAppointmentAttributeTypes()]).then(function (response) {
                    $scope.surgeons = surgicalAppointmentHelper.filterProvidersByUuid(providerUuids, response[0].data.results);
                    $scope.locations = response[1].data.results;
                    $scope.attributeTypes = response[2].data.results;
                    if ($stateParams.surgicalBlockUuid) {
                        return surgicalAppointmentService.getSurgicalBlockFor($stateParams.surgicalBlockUuid).then(function (response) {
                            $scope.surgicalForm = new Bahmni.OT.SurgicalBlockMapper().map(response.data, $scope.attributeTypes, $scope.surgeons);
                            if ($stateParams.surgicalAppointmentId) {
                                $scope.editAppointment(_.find($scope.surgicalForm.surgicalAppointments, function (appointment) {
                                    return appointment.id === $stateParams.surgicalAppointmentId;
                                }));
                            }
                            return response;
                        });
                    }
                    return response;
                });
            };

            var getAppointmentDuration = function (surgicalAppointment) {
                return surgicalAppointmentHelper.getAppointmentDuration(surgicalAppointment.surgicalAppointmentAttributes.estTimeHours.value, surgicalAppointment.surgicalAppointmentAttributes.estTimeMinutes.value, surgicalAppointment.surgicalAppointmentAttributes.cleaningTime.value);
            };

            var getAvailableBlockDuration = function () {
                var blockDuration = Bahmni.Common.Util.DateUtil.diffInMinutes($scope.surgicalForm.startDatetime, $scope.surgicalForm.endDatetime);
                var appointmentsDuration = _.sumBy(_.reject($scope.surgicalForm.surgicalAppointments, ['sortWeight', null]), function (appointment) {
                    return getAppointmentDuration(appointment);
                });
                return blockDuration - appointmentsDuration;
            };

            $scope.getPatientName = function (surgicalAppointment) {
                return surgicalAppointment.patient.value || surgicalAppointmentHelper.getPatientDisplayLabel(surgicalAppointment.patient.display);
            };

            $scope.editAppointment = function (surgicalAppointment) {
                var clone = _.cloneDeep(surgicalAppointment);
                surgicalAppointment.isBeingEdited = true;
                $scope.addNewSurgicalAppointment(clone);
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
                $scope.updateSortWeight();
                var surgicalBlock = new Bahmni.OT.SurgicalBlockMapper().mapSurgicalBlockUIToDomain(surgicalForm);
                spinner.forPromise(surgicalAppointmentService.saveSurgicalBlock(surgicalBlock)).then(function (response) {
                    $scope.surgicalForm = new Bahmni.OT.SurgicalBlockMapper().map(response.data, $scope.attributeTypes, $scope.surgeons);
                    messagingService.showMessage('info', "{{'OT_SAVE_SUCCESS_MESSAGE_KEY' | translate}}");
                    $state.go('editSurgicalAppointment', {surgicalBlockUuid: response.data.uuid});
                });
            };

            var addOrUpdateTheSurgicalAppointment = function (surgicalAppointment) {
                if (surgicalAppointment.sortWeight >= 0) {
                    var existingAppointment = _.find($scope.surgicalForm.surgicalAppointments, function (appointment) {
                        return appointment.isBeingEdited;
                    });
                    existingAppointment.notes = surgicalAppointment.notes;
                    existingAppointment.patient = surgicalAppointment.patient;
                    existingAppointment.surgicalAppointmentAttributes = surgicalAppointment.surgicalAppointmentAttributes;
                    existingAppointment.isBeingEdited = false;
                } else {
                    surgicalAppointment.sortWeight = $scope.surgicalForm.surgicalAppointments.length;
                    $scope.surgicalForm.surgicalAppointments.push(surgicalAppointment);
                }
            };

            var canBeFittedInTheSurgicalBlock = function (surgicalAppointment) {
                if (surgicalAppointment.sortWeight >= 0) {
                    var existingAppointment = _.find($scope.surgicalForm.surgicalAppointments, function (appointment) {
                        return appointment.sortWeight === surgicalAppointment.sortWeight;
                    });
                    var increasedDeltaTime = getAppointmentDuration(surgicalAppointment) - getAppointmentDuration(existingAppointment);
                    return getAvailableBlockDuration() >= increasedDeltaTime;
                }
                return getAvailableBlockDuration() >= getAppointmentDuration(surgicalAppointment);
            };

            $scope.addSurgicalAppointment = function (surgicalAppointment) {
                if (canBeFittedInTheSurgicalBlock(surgicalAppointment)) {
                    addOrUpdateTheSurgicalAppointment(surgicalAppointment);
                    ngDialog.close();
                }
                else {
                    messagingService.showMessage('error', "{{'OT_SURGICAL_APPOINTMENT_EXCEEDS_BLOCK_DURATION' | translate}}");
                }
            };

            $scope.updateSortWeight = function () {
                _.map($scope.surgicalForm.surgicalAppointments, function (appointment, index) {
                    appointment.sortWeight = index;
                    return appointment;
                });
            };

            $scope.goToHome = function () {
                var options = {};
                options['dashboardCachebuster'] = Math.random();
                $state.go("home", options);
            };

            $scope.cancelAppointment = function (surgicalAppointment) {
                var clonedAppointment = _.cloneDeep(surgicalAppointment);
                surgicalAppointment.isBeingEdited = true;
                ngDialog.open({
                    template: "views/cancelAppointment.html",
                    controller: "surgicalBlockViewCancelAppointmentController",
                    closeByDocument: false,
                    showClose: true,
                    scope: $scope,
                    data: {
                        surgicalAppointment: clonedAppointment,
                        surgicalForm: $scope.surgicalForm
                    }
                });
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
