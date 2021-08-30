'use strict';

angular.module('bahmni.ot')
    .controller('surgicalBlockController', ['$scope', '$q', '$state', '$stateParams', 'spinner', 'surgicalAppointmentService', 'locationService', 'appService', 'messagingService', 'surgicalAppointmentHelper', 'surgicalBlockHelper', 'ngDialog',
        function ($scope, $q, $state, $stateParams, spinner, surgicalAppointmentService, locationService, appService, messagingService, surgicalAppointmentHelper, surgicalBlockHelper, ngDialog) {
            var init = function () {
                $scope.surgicalForm = {
                    surgicalAppointments: []
                };
                $scope.configuredSurgeryAttributeNames = appService.getAppDescriptor().getConfigValue("surgeryAttributes");
                $scope.defaultAttributeTranslations = surgicalAppointmentHelper.getDefaultAttributeTranslations();
                var providerNamesFromConfig = appService.getAppDescriptor().getConfigValue("primarySurgeonsForOT");
                return $q.all([surgicalAppointmentService.getSurgeons(), locationService.getAllByTag("Operation Theater"), surgicalAppointmentService.getSurgicalAppointmentAttributeTypes()]).then(function (response) {
                    $scope.surgeons = surgicalAppointmentHelper.filterProvidersByName(providerNamesFromConfig, response[0].data.results);
                    $scope.locations = response[1].data.results;
                    $scope.attributeTypes = response[2].data.results;
                    if ($stateParams.surgicalBlockUuid) {
                        return surgicalAppointmentService.getSurgicalBlockFor($stateParams.surgicalBlockUuid).then(function (response) {
                            $scope.surgicalForm = new Bahmni.OT.SurgicalBlockMapper().map(response.data, $scope.attributeTypes, $scope.surgeons);
                            $scope.surgicalForm.surgicalAppointments = surgicalAppointmentHelper.filterSurgicalAppointmentsByStatus(
                                $scope.surgicalForm.surgicalAppointments, [Bahmni.OT.Constants.scheduled, Bahmni.OT.Constants.completed]);
                            var selectedSurgicalAppointment = _.find($scope.surgicalForm.surgicalAppointments, function (appointment) {
                                return appointment.id === $stateParams.surgicalAppointmentId;
                            });
                            if (selectedSurgicalAppointment) {
                                $scope.editAppointment(selectedSurgicalAppointment);
                            }
                            getAvailableBlockDurationInHoursAndMinutesFormat();
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
                return surgicalBlockHelper.getAvailableBlockDuration($scope.surgicalForm);
            };

            $scope.getPatientName = function (surgicalAppointment) {
                return surgicalAppointment.patient.value || surgicalAppointmentHelper.getPatientDisplayLabel(surgicalAppointment.patient.display);
            };

            $scope.editAppointment = function (surgicalAppointment) {
                _.forEach($scope.surgicalForm.surgicalAppointments, function (surgicalAppointment) {
                    delete surgicalAppointment.isBeingEdited;
                });
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

            $scope.closeDialog = function () {
                ngDialog.close();
            };

            $scope.saveAnywaysFlag = false;

            $scope.saveAnyways = function (surgicalForm) {
                $scope.saveAnywaysFlag = true;
                $scope.save(surgicalForm);
                ngDialog.close();
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
                if ($scope.saveAnywaysFlag || Bahmni.Common.Util.DateUtil.isSameDate(surgicalForm.startDatetime, surgicalForm.endDatetime)) {
                    $scope.updateSortWeight(surgicalForm);
                    var surgicalBlock = new Bahmni.OT.SurgicalBlockMapper().mapSurgicalBlockUIToDomain(surgicalForm);
                    var saveOrupdateSurgicalBlock = _.isEmpty(surgicalBlock.uuid) ? surgicalAppointmentService.saveSurgicalBlock : surgicalAppointmentService.updateSurgicalBlock;
                    spinner.forPromise(saveOrupdateSurgicalBlock(surgicalBlock)).then(function (response) {
                        $scope.surgicalForm = new Bahmni.OT.SurgicalBlockMapper().map(response.data, $scope.attributeTypes, $scope.surgeons);
                        $scope.surgicalForm.surgicalAppointments = surgicalAppointmentHelper.filterSurgicalAppointmentsByStatus(
                            $scope.surgicalForm.surgicalAppointments, [Bahmni.OT.Constants.scheduled, Bahmni.OT.Constants.completed]);
                        messagingService.showMessage('info', "{{'OT_SAVE_SUCCESS_MESSAGE_KEY' | translate}}");
                        $state.go('editSurgicalAppointment', {surgicalBlockUuid: response.data.uuid});
                    });
                    $scope.saveAnywaysFlag = false;
                } else {
                    ngDialog.open({
                        template: 'views/surgicalBlockMultipleDaysDialog.html',
                        className: 'ngdialog-theme-default',
                        closeByNavigation: true,
                        data: { surgicalForm: surgicalForm },
                        scope: $scope
                    });
                }
            };

            var addOrUpdateTheSurgicalAppointment = function (surgicalAppointment) {
                if (surgicalAppointment.sortWeight >= 0) {
                    var existingAppointment = _.find($scope.surgicalForm.surgicalAppointments, function (appointment) {
                        return appointment.isBeingEdited === true;
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

            var checkIfSurgicalAppointmentIsDirty = function (surgicalAppointment) {
                if (!surgicalAppointment.id) {
                    return;
                }
                var savedSurgicalAppointment = _.find($scope.surgicalForm.surgicalAppointments, function (appointment) {
                    return appointment.id === surgicalAppointment.id;
                });
                delete savedSurgicalAppointment.$$hashKey;
                delete savedSurgicalAppointment.isDirty;
                surgicalAppointment.isBeingEdited = savedSurgicalAppointment.isBeingEdited;
                _.isEqual(savedSurgicalAppointment, surgicalAppointment) ? savedSurgicalAppointment.isDirty = false : savedSurgicalAppointment.isDirty = true;
            };

            var getAvailableBlockDurationInHoursAndMinutesFormat = function () {
                var availableBlockDuration = getAvailableBlockDuration();
                $scope.availableBlockDuration = Math.floor(availableBlockDuration / 60) + " hr " + availableBlockDuration % 60 + " mins";
            };

            $scope.addSurgicalAppointment = function (surgicalAppointment) {
                if (canBeFittedInTheSurgicalBlock(surgicalAppointment)) {
                    checkIfSurgicalAppointmentIsDirty(surgicalAppointment);
                    addOrUpdateTheSurgicalAppointment(surgicalAppointment);
                    getAvailableBlockDurationInHoursAndMinutesFormat();
                    ngDialog.close();
                    surgicalAppointment.isBeingEdited = false;
                    surgicalAppointment.isDirty = true;

                    var appointmentIndex;
                    _.find($scope.surgicalForm.surgicalAppointments, function (appointment, index) {
                        appointmentIndex = index;
                        return surgicalAppointment.sortWeight === appointment.sortWeight;
                    });
                    $scope.surgicalForm.surgicalAppointments[appointmentIndex] = surgicalAppointment;
                }
                else {
                    messagingService.showMessage('error', "{{'OT_SURGICAL_APPOINTMENT_EXCEEDS_BLOCK_DURATION' | translate}}");
                }
            };

            $scope.updateSortWeight = function (surgicalBlock) {
                var index = 0;
                _.map(surgicalBlock && surgicalBlock.surgicalAppointments, function (appointment) {
                    if (appointment.status !== 'POSTPONED' && appointment.status !== 'CANCELLED') {
                        appointment.sortWeight = index++;
                    }
                    return appointment;
                });
            };

            $scope.gotoCalendarPage = function () {
                var options = {};
                options['dashboardCachebuster'] = Math.random();
                $state.go("otScheduling", options);
            };

            $scope.cancelSurgicalBlock = function () {
                ngDialog.open({
                    template: "views/cancelSurgicalBlock.html",
                    closeByDocument: false,
                    controller: "cancelSurgicalBlockController",
                    className: 'ngdialog-theme-default ng-dialog-adt-popUp',
                    showClose: true,
                    data: {
                        surgicalBlock: new Bahmni.OT.SurgicalBlockMapper().mapSurgicalBlockUIToDomain($scope.surgicalForm),
                        provider: $scope.surgicalForm.provider.person.display
                    }
                });
            };

            $scope.cancelAppointment = function (surgicalAppointment) {
                surgicalAppointment.isBeingEdited = true;
                var clonedAppointment = _.cloneDeep(surgicalAppointment);
                ngDialog.open({
                    template: "views/cancelAppointment.html",
                    controller: "surgicalBlockViewCancelAppointmentController",
                    closeByDocument: false,
                    showClose: true,
                    className: 'ngdialog-theme-default ng-dialog-adt-popUp',
                    scope: $scope,
                    data: {
                        surgicalAppointment: clonedAppointment,
                        surgicalForm: $scope.surgicalForm,
                        updateAvailableBlockDurationFn: getAvailableBlockDurationInHoursAndMinutesFormat
                    }
                });
            };

            $scope.cancelDisabled = function () {
                var surgicalBlockWithCompletedAppointments = function () {
                    return _.find($scope.surgicalForm.surgicalAppointments, function (appointment) {
                        return appointment.status === Bahmni.OT.Constants.completed;
                    });
                };
                return !$scope.surgicalForm.id || surgicalBlockWithCompletedAppointments();
            };

            $scope.addNewSurgicalAppointment = function (surgicalAppointment) {
                ngDialog.open({
                    template: "views/surgicalAppointment.html",
                    controller: "NewSurgicalAppointmentController",
                    closeByDocument: false,
                    className: 'ngdialog-theme-default surgical-appointment-dialog',
                    showClose: true,
                    closeByNavigation: true,
                    scope: $scope,
                    data: surgicalAppointment
                });
            };

            $scope.changeInStartDateTime = function () {
                if (_.isUndefined($scope.surgicalForm.endDatetime)) {
                    var calendarConfig = appService.getAppDescriptor().getConfigValue("calendarView");
                    var dayViewEnd = (calendarConfig.dayViewEnd || Bahmni.OT.Constants.defaultCalendarEndTime).split(':');
                    $scope.surgicalForm.endDatetime = Bahmni.Common.Util.DateUtil.addMinutes(moment($scope.surgicalForm.startDatetime).startOf('day').toDate(), (dayViewEnd[0] * 60 + parseInt(dayViewEnd[1])));
                }
            };

            $scope.getConfiguredAttributes = function (attributes) {
                return surgicalAppointmentHelper.getAttributesFromAttributeNames(attributes, $scope.configuredSurgeryAttributeNames);
            };

            $scope.isSurgeryAttributesConfigurationAvailableAndValid = function () {
                return $scope.configuredSurgeryAttributeNames && $scope.configuredSurgeryAttributeNames.length > 0;
            };

            $scope.sort = function (attributes) {
                return surgicalAppointmentHelper.getAttributesFromAttributeTypes(attributes, $scope.attributeTypes);
            };

            spinner.forPromise(init());
        }]);
