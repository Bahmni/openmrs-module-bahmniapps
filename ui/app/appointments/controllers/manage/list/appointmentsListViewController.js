'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsListViewController', ['$scope', '$state', '$rootScope', '$translate', '$stateParams', 'spinner',
        'appointmentsService', 'appService', 'appointmentsFilter', 'printer', 'checkinPopUp', 'confirmBox', 'ngDialog', 'messagingService', 'appointmentCommonService', '$interval',
        function ($scope, $state, $rootScope, $translate, $stateParams, spinner, appointmentsService, appService,
                  appointmentsFilter, printer, checkinPopUp, confirmBox, ngDialog, messagingService, appointmentCommonService, $interval) {
            $scope.enableSpecialities = appService.getAppDescriptor().getConfigValue('enableSpecialities');
            $scope.enableServiceTypes = appService.getAppDescriptor().getConfigValue('enableServiceTypes');
            $scope.allowedActions = appService.getAppDescriptor().getConfigValue('allowedActions') || [];
            $scope.allowedActionsByStatus = appService.getAppDescriptor().getConfigValue('allowedActionsByStatus') || {};
            $scope.colorsForListView = appService.getAppDescriptor().getConfigValue('colorsForListView') || {};
            var maxAppointmentProviders = appService.getAppDescriptor().getConfigValue('maxAppointmentProviders') || 1;
            $scope.enableResetAppointmentStatuses = appService.getAppDescriptor().getConfigValue('enableResetAppointmentStatuses');
            $scope.manageAppointmentPrivilege = Bahmni.Appointments.Constants.privilegeManageAppointments;
            $scope.ownAppointmentPrivilege = Bahmni.Appointments.Constants.privilegeOwnAppointments;
            $scope.resetAppointmentStatusPrivilege = Bahmni.Appointments.Constants.privilegeResetAppointmentStatus;
            $scope.searchedPatient = false;
            $scope.additionalInfoColumns = appService.getAppDescriptor().getConfigValue('additionalInfoColumns') || {};
            var autoRefreshIntervalInSeconds = parseInt(appService.getAppDescriptor().getConfigValue('autoRefreshIntervalInSeconds'));
            var enableAutoRefresh = !isNaN(autoRefreshIntervalInSeconds);
            var autoRefreshStatus = true;
            const SECONDS_TO_MILLISECONDS_FACTOR = 1000;
            var oldPatientData = [];
            var currentUserPrivileges = $rootScope.currentUser.privileges;
            var currentProviderUuId = $rootScope.currentProvider.uuid;
            $scope.$on('filterClosedOpen', function (event, args) {
                $scope.isFilterOpen = args.filterViewStatus;
            });
            var init = function () {
                $scope.searchedPatient = $stateParams.isSearchEnabled && $stateParams.patient;
                $scope.startDate = $stateParams.viewDate || moment().startOf('day').toDate();
                $scope.isFilterOpen = $stateParams.isFilterOpen;
            };
            var buildTableHeader = function () {
                $scope.tableInfo = [{heading: 'APPOINTMENT_PATIENT_ID', sortInfo: 'patient.identifier', enable: true},
                    {heading: 'APPOINTMENT_PATIENT_NAME', sortInfo: 'patient.name', class: true, enable: true},
                    {heading: 'APPOINTMENT_DATE', sortInfo: 'date', enable: true},
                    {heading: 'APPOINTMENT_START_TIME_KEY', sortInfo: 'startDateTime', enable: true},
                    {heading: 'APPOINTMENT_END_TIME_KEY', sortInfo: 'endDateTime', enable: true},
                    {heading: 'APPOINTMENT_PROVIDER', sortInfo: 'provider.name', class: true, enable: true},
                    {heading: 'APPOINTMENT_SERVICE_SPECIALITY_KEY', sortInfo: 'service.speciality.name', enable: $scope.enableSpecialities},
                    {heading: 'APPOINTMENT_SERVICE', sortInfo: 'service.name', class: true, enable: true},
                    {heading: 'APPOINTMENT_SERVICE_TYPE_FULL', sortInfo: 'serviceType.name', class: true, enable: $scope.enableServiceTypes},
                    {heading: 'APPOINTMENT_STATUS', sortInfo: 'status', enable: true},
                    {heading: 'APPOINTMENT_WALK_IN', sortInfo: 'appointmentKind', enable: true},
                    {heading: 'APPOINTMENT_SERVICE_LOCATION_KEY', sortInfo: 'location.name', class: true, enable: true},
                    {heading: 'APPOINTMENT_CREATE_NOTES', sortInfo: 'comments', enable: true}];
                if ($scope.additionalInfoColumns.length > 0) {
                    $scope.tableInfo.splice($scope.tableInfo.length - 1, 0,
                    {heading: 'APPOINTMENT_ADDITIONAL_INFO', sortInfo: 'additionalInfo', class: true, enable: true});
                } else {
                    _.forEach($scope.additionalInfoColumns, function (key, value) {
                        var str = value.replace(/ +/g, "");
                        $scope.tableInfo.splice($scope.tableInfo.length - 1, 0,
                        { heading: 'APPOINTMENT_ADDITIONAL_INFO_COLUMN_' + str.toUpperCase(), sortInfo: value, class: true, enable: true});
                    });
                }
            };

            var setAppointments = function (params) {
                autoRefreshStatus = false;
                return appointmentsService.getAllAppointments(params).then(function (response) {
                    $scope.appointments = response.data;
                    $scope.filteredAppointments = appointmentsFilter($scope.appointments, $stateParams.filterParams);
                    $rootScope.appointmentsData = $scope.filteredAppointments;
                    updateSelectedAppointment();
                    autoRefreshStatus = true;
                });
            };

            var updateSelectedAppointment = function () {
                if ($scope.selectedAppointment === undefined) {
                    return;
                }
                $scope.selectedAppointment = _.find($scope.filteredAppointments, function (appointment) {
                    return appointment.uuid === $scope.selectedAppointment.uuid;
                });
            };

            var setAppointmentsInPatientSearch = function (patientUuid) {
                appointmentsService.search({patientUuid: patientUuid}).then(function (response) {
                    var appointmentsInDESCOrderBasedOnStartDateTime = _.sortBy(response.data, "startDateTime").reverse();
                    setFilteredAppointmentsInPatientSearch(appointmentsInDESCOrderBasedOnStartDateTime);
                });
            };

            var setAppointmentsInAutoRefresh = function () {
                if (!autoRefreshStatus) {
                    return;
                }
                if ($stateParams.isSearchEnabled) {
                    setAppointmentsInPatientSearch($stateParams.patient.uuid);
                }
                else {
                    var viewDate = $state.params.viewDate || moment().startOf('day').toDate();
                    setAppointments({forDate: viewDate});
                }
            };

            var autoRefresh = (function () {
                if (!enableAutoRefresh) {
                    return;
                }
                var autoRefreshIntervalInMilliSeconds = autoRefreshIntervalInSeconds * SECONDS_TO_MILLISECONDS_FACTOR;
                return $interval(setAppointmentsInAutoRefresh, autoRefreshIntervalInMilliSeconds);
            })();

            $scope.$on('$destroy', function () {
                if (enableAutoRefresh) {
                    $interval.cancel(autoRefresh);
                }
            });

            $scope.getAppointmentsForDate = function (viewDate) {
                $stateParams.viewDate = viewDate;
                $scope.selectedAppointment = undefined;
                var params = {forDate: viewDate};
                $scope.$on('$stateChangeStart', function (event, toState, toParams) {
                    if (toState.tabName == 'calendar') {
                        toParams.doFetchAppointmentsData = false;
                    }
                });
                if ($state.params.doFetchAppointmentsData) {
                    spinner.forPromise(setAppointments(params));
                } else {
                    $scope.filteredAppointments = appointmentsFilter($state.params.appointmentsData, $stateParams.filterParams);
                    $state.params.doFetchAppointmentsData = true;
                }
            };

            $scope.getProviderNamesForAppointment = function (appointment) {
                if (appointment.providers != undefined) {
                    return appointment.providers.filter(function (p) { return p.response != 'CANCELLED'; }).map(function (p) { return p.name; }).join(',');
                    // app.provider = app.providers.length > 0 ? app.providers[0] : null;
                } else {
                    return '';
                }
            };

            var setFilteredAppointmentsInPatientSearch = function (appointments) {
                $scope.filteredAppointments = appointments.map(function (appointmet) {
                    appointmet.date = appointmet.startDateTime;
                    return appointmet;
                });
            };

            $scope.displaySearchedPatient = function (appointments) {
                oldPatientData = $scope.filteredAppointments;
                setFilteredAppointmentsInPatientSearch(appointments);
                $scope.searchedPatient = true;
                $stateParams.isFilterOpen = false;
                $scope.isFilterOpen = false;
                $stateParams.isSearchEnabled = true;
                $scope.selectedAppointment = undefined;
            };

            $scope.hasNoAppointments = function () {
                return _.isEmpty($scope.filteredAppointments);
            };
            $scope.hasAdditionalInfoColumnsEntered = function () {
                return _.isEmpty($scope.additionalInfoColumns);
            };
            $scope.goBackToPreviousView = function () {
                $scope.searchedPatient = false;
                $scope.filteredAppointments = oldPatientData;
                $stateParams.isFilterOpen = true;
                $scope.isFilterOpen = true;
                $stateParams.isSearchEnabled = false;
            };

            $scope.isSelected = function (appointment) {
                return $scope.selectedAppointment === appointment;
            };

            $scope.select = function (appointment) {
                if ($scope.isSelected(appointment)) {
                    $scope.selectedAppointment = undefined;
                    return;
                }
                $scope.selectedAppointment = appointment;
            };

            $scope.isWalkIn = function (appointmentType) {
                return appointmentType === 'WalkIn' ? 'Yes' : 'No';
            };

            $scope.editAppointment = function () {
                var params = $stateParams;
                params.uuid = $scope.selectedAppointment.uuid;
                $state.go('home.manage.appointments.list.edit', params);
            };

            $scope.checkinAppointment = function () {
                var scope = $rootScope.$new();
                scope.message = $translate.instant('APPOINTMENT_STATUS_CHANGE_CONFIRM_MESSAGE', {
                    toStatus: 'CheckedIn'
                });
                scope.action = _.partial(changeStatus, 'CheckedIn', _);
                checkinPopUp({
                    scope: scope,
                    className: "ngdialog-theme-default app-dialog-container"
                });
            };

            $scope.$watch(function () {
                return $stateParams.filterParams;
            }, function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $scope.filteredAppointments = appointmentsFilter($scope.appointments || $state.params.appointmentsData, $stateParams.filterParams);
                }
            }, true);

            $scope.sortAppointmentsBy = function (sortColumn) {
                if (sortColumn === 'additionalInfo') {
                    $scope.filteredAppointments = $scope.filteredAppointments.map(function (appointment) {
                        appointment.additionalInformation = $scope.display(_.get(appointment, sortColumn));
                        return appointment;
                    });
                    sortColumn = "additionalInformation";
                }

                var emptyObjects = _.filter($scope.filteredAppointments, function (appointment) {
                    return !_.property(sortColumn)(appointment);
                });
                if (_.includes($scope.additionalInfoColumns, sortColumn)) {
                    emptyObjects = _.filter($scope.filteredAppointments, function (appointment) {
                        return !_.property(sortColumn)(appointment.additionalInfo);
                    });
                }
                if (sortColumn === "provider.name") {
                    emptyObjects = $scope.filteredAppointments.filter(function (fa) {
                        return _.every(fa.providers, {"response": Bahmni.Appointments.Constants.providerResponses.CANCELLED }) || _.isEmpty(fa.providers);
                    });
                }

                var nonEmptyObjects = _.difference($scope.filteredAppointments, emptyObjects);
                var sortedNonEmptyObjects = _.sortBy(nonEmptyObjects, function (appointment) {
                    if (sortColumn === "provider.name") {
                        var firstProvider = appointment.providers.find(function (p) {
                            return p.response !== Bahmni.Appointments.Constants.providerResponses.CANCELLED;
                        });
                        return firstProvider.name.toLowerCase();
                    }

                    if (angular.isNumber(_.get(appointment, sortColumn))) {
                        return _.get(appointment, sortColumn);
                    }
                    if (_.includes($scope.additionalInfoColumns, sortColumn)) {
                        return _.get(appointment.additionalInfo, sortColumn).toLowerCase();
                    }
                    return _.get(appointment, sortColumn).toLowerCase();
                });
                if ($scope.reverseSort) {
                    sortedNonEmptyObjects.reverse();
                }
                $scope.filteredAppointments = sortedNonEmptyObjects.concat(emptyObjects);
                $scope.sortColumn = sortColumn;
                $scope.reverseSort = !$scope.reverseSort;
            };

            $scope.printPage = function () {
                var printTemplateUrl = appService.getAppDescriptor().getConfigValue("printListViewTemplateUrl") || 'views/manage/list/defaultListPrint.html';
                printer.print(printTemplateUrl, {
                    searchedPatient: $scope.searchedPatient,
                    filteredAppointments: $scope.filteredAppointments,
                    startDate: $stateParams.viewDate,
                    enableServiceTypes: $scope.enableServiceTypes,
                    enableSpecialities: $scope.enableSpecialities
                });
            };

            $scope.undoCheckIn = function () {
                var scope = {};
                scope.message = $translate.instant('APPOINTMENT_UNDO_CHECKIN_CONFIRM_MESSAGE');
                scope.yes = resetStatus;
                showPopUp(scope);
            };

            var resetStatus = function (closeConfirmBox) {
                return appointmentsService.changeStatus($scope.selectedAppointment.uuid, 'Scheduled', null).then(function (response) {
                    $scope.selectedAppointment.status = response.data.status;
                    var message = $translate.instant('APPOINTMENT_STATUS_CHANGE_SUCCESS_MESSAGE', {
                        toStatus: response.data.status
                    });
                    closeConfirmBox();
                    messagingService.showMessage('info', message);
                });
            };

            $scope.reset = function () {
                var scope = {};
                scope.message = $translate.instant('APPOINTMENT_RESET_CONFIRM_MESSAGE');
                scope.yes = resetStatus;
                showPopUp(scope);
            };

            var changeStatus = function (toStatus, onDate, closeConfirmBox) {
                var message = $translate.instant('APPOINTMENT_STATUS_CHANGE_SUCCESS_MESSAGE', {
                    toStatus: toStatus
                });
                return appointmentsService.changeStatus($scope.selectedAppointment.uuid, toStatus, onDate).then(function (response) {
                    ngDialog.close();
                    $scope.selectedAppointment.status = response.data.status;
                    closeConfirmBox();
                    messagingService.showMessage('info', message);
                });
            };

            $scope.confirmAction = function (toStatus) {
                var scope = {};
                scope.message = $translate.instant('APPOINTMENT_STATUS_CHANGE_CONFIRM_MESSAGE', {
                    toStatus: toStatus
                });
                scope.yes = _.partial(changeStatus, toStatus, undefined, _);
                showPopUp(scope);
            };
            $scope.displayNewColumns = function (jsonObj, columnName) {
                if (jsonObj != null) {
                    return jsonObj[columnName];
                }
            };
            $scope.display = function (jsonObj) {
                jsonObj = _.mapKeys(jsonObj, function (value, key) {
                    return $translate.instant(key);
                });
                if (_.isEmpty($scope.additionalInfoColumns)) {
                    var colList = [];
                    angular.forEach(jsonObj, function (value, key) {
                        if (!_.includes($scope.additionalInfoColumns, key)) {
                            colList.push(jsonObj[value]);
                        }
                    });
                    return Object.values(colList).join(", ");
                }
                return JSON.stringify(jsonObj || '').replace(/[{\"}]/g, "").replace(/[,]/g, ",\t");
            };
            var showPopUp = function (popUpScope) {
                popUpScope.no = function (closeConfirmBox) {
                    closeConfirmBox();
                };
                confirmBox({
                    scope: popUpScope,
                    actions: [{name: 'yes', display: 'YES_KEY'}, {name: 'no', display: 'NO_KEY'}],
                    className: "ngdialog-theme-default"
                });
            };

            $scope.isAllowedAction = function (action) {
                return _.includes($scope.allowedActions, action);
            };

            $scope.isValidActionAndIsUserAllowedToPerformEdit = function (action) {
                if (!_.isUndefined($scope.selectedAppointment)) {
                    var appointmentProvider = $scope.selectedAppointment.providers;
                    return !appointmentCommonService.isUserAllowedToPerformEdit(appointmentProvider, currentUserPrivileges, currentProviderUuId)
                        ? false : isValidAction(action);
                }
                return false;
            };

            var isValidAction = function (action) {
                var status = $scope.selectedAppointment.status;
                var allowedActions = $scope.allowedActionsByStatus.hasOwnProperty(status) ? $scope.allowedActionsByStatus[status] : [];
                return _.includes(allowedActions, action);
            };

            var isCurrentUserHavePrivilege = function (privilege) {
                return !_.isUndefined(_.find($rootScope.currentUser.privileges, function (userPrivilege) {
                    return userPrivilege.name === privilege;
                }));
            };

            $scope.isUserAllowedToPerform = function () {
                if (isCurrentUserHavePrivilege($scope.manageAppointmentPrivilege)) {
                    return true;
                }
                else if (isCurrentUserHavePrivilege($scope.ownAppointmentPrivilege)) {
                    if ($scope.selectedAppointment) {
                        return _.isNull($scope.selectedAppointment.provider) ||
                            $scope.selectedAppointment.provider.uuid === $rootScope.currentProvider.uuid;
                    }
                }
                return false;
            };

            $scope.isUndoCheckInAllowed = function () {
                return $scope.isUserAllowedToPerform() &&
                    isCurrentUserHavePrivilege($scope.resetAppointmentStatusPrivilege) &&
                    $scope.selectedAppointment &&
                    $scope.selectedAppointment.status === 'CheckedIn';
            };

            $scope.isEditAllowed = function () {
                if (!_.isUndefined($scope.selectedAppointment)) {
                    var appointmentProvider = $scope.selectedAppointment.providers;
                    return maxAppointmentProviders > 1 ? true : appointmentCommonService.isUserAllowedToPerformEdit(appointmentProvider, currentUserPrivileges, currentProviderUuId);
                }
                return false;
            };

            $scope.isResetAppointmentStatusFeatureEnabled = function () {
                return !(_.isNull($scope.enableResetAppointmentStatuses) ||
                    _.isUndefined($scope.enableResetAppointmentStatuses));
            };

            var isSelectedAppointmentStatusAllowedToReset = function () {
                return _.isArray($scope.enableResetAppointmentStatuses) &&
                    _.includes($scope.enableResetAppointmentStatuses, $scope.selectedAppointment.status);
            };

            $scope.isResetAppointmentStatusAllowed = function () {
                return $scope.isUserAllowedToPerform() &&
                    isCurrentUserHavePrivilege($scope.resetAppointmentStatusPrivilege) &&
                    $scope.selectedAppointment &&
                    $scope.selectedAppointment.status != 'Scheduled' &&
                    isSelectedAppointmentStatusAllowedToReset();
            };

            init();
            buildTableHeader();
        }]);
