'use strict';

angular.module('bahmni.ot')
    .controller('calendarViewController', ['$scope', '$rootScope', '$state', '$stateParams', 'appService', 'patientService', 'locationService', 'ngDialog', 'surgicalAppointmentHelper',
        function ($scope, $rootScope, $state, $stateParams, appService, patientService, locationService, ngDialog, surgicalAppointmentHelper) {
            var CALENDAR_VIEW = 'Calendar';
            $scope.viewDate = $stateParams.viewDate || $state.viewDate || (moment().startOf('day')).toDate();
            $state.viewDate = $scope.viewDate;
            $scope.calendarConfig = appService.getAppDescriptor().getConfigValue("calendarView");
            var weekStartDay = appService.getAppDescriptor().getConfigValue('startOfWeek') || Bahmni.OT.Constants.defaultWeekStartDayName;
            var currentDate = moment().startOf('day').toDate();
            $scope.startOfWeekCode = Bahmni.OT.Constants.weekDays[weekStartDay];
            $scope.weekStartDate = $state.weekStartDate || Bahmni.Common.Util.DateUtil.getWeekStartDate(currentDate, $scope.startOfWeekCode);
            $state.weekStartDate = $scope.weekStartDate;
            var addLocationsForFilters = function () {
                var locations = {};
                _.each($scope.locations, function (location) {
                    locations[location.name] = true;
                });
                $scope.filters.locations = locations;
            };
            var addListenersToAutoFilterResults = function () {
                $scope.$watch("filters.providers", function () {
                    if (!_.isUndefined($scope.filters.providers)) {
                        $scope.applyFilters();
                    }
                });
                $scope.$watch("filters.patient", function () {
                    if (!_.isUndefined($scope.filters.patient)) {
                        $scope.applyFilters();
                    }
                });
                $scope.$watch("filters.statusList", function () {
                    if (!_.isUndefined($scope.filters.statusList)) {
                        $scope.applyFilters();
                    }
                });
            };
            var init = function () {
                $scope.filterParams = $state.filterParams;
                $scope.filters = {};
                $scope.filters.providers = [];
                $scope.view = $state.view || CALENDAR_VIEW;
                $state.view = $scope.view;
                $scope.weekOrDay = $state.weekOrDay || 'day';
                $state.weekOrDay = $scope.weekOrDay;
                $scope.isFilterOpen = true;
                if ($scope.weekOrDay === 'week') {
                    $scope.weekStartDate = $state.weekStartDate || new Date(moment().startOf('week'));
                    $state.weekStartDate = $scope.weekStartDate;
                    $scope.weekEndDate = $state.weekEndDate || new Date(moment().endOf('week').endOf('day'));
                    $state.weekEndDate = $scope.weekEndDate;
                }
                $scope.surgicalBlockSelected = {};
                $scope.surgicalAppointmentSelected = {};
                $scope.editDisabled = true;
                $scope.moveButtonDisabled = true;
                $scope.cancelDisabled = true;
                $scope.addActualTimeDisabled = true;
                $scope.surgeonList = _.map($rootScope.surgeons, function (surgeon) {
                    var newVar = {
                        name: surgeon.person.display,
                        uuid: surgeon.uuid
                    };
                    newVar[surgeon.person.display] = false;
                    var otCalendarColorAttribute = _.find(surgeon.attributes, function (attribute) {
                        return attribute.attributeType.display === 'otCalendarColor';
                    });
                    newVar.otCalendarColor = getBackGroundHSLColorFor(otCalendarColorAttribute);
                    return newVar;
                });
                $scope.filters.statusList = [];
                $rootScope.providerToggle = appService.getAppDescriptor().getConfigValue("defaultViewAsSurgeonBased");
                setAppointmentStatusList($scope.view);
                return locationService.getAllByTag('Operation Theater').then(function (response) {
                    $scope.locations = response.data.results;
                    addLocationsForFilters();
                    $scope.filters = $scope.filterParams || $scope.filters;
                    $scope.patient = $scope.filters.patient && $scope.filters.patient.value;
                    $scope.applyFilters();
                    addListenersToAutoFilterResults();
                    return $scope.locations;
                });
            };

            var setAppointmentStatusList = function (view) {
                if (view === CALENDAR_VIEW) {
                    $scope.appointmentStatusList = [{name: Bahmni.OT.Constants.scheduled}, {name: Bahmni.OT.Constants.completed}];
                } else {
                    $scope.appointmentStatusList = [{name: Bahmni.OT.Constants.scheduled}, {name: Bahmni.OT.Constants.completed},
                        {name: Bahmni.OT.Constants.postponed}, {name: Bahmni.OT.Constants.cancelled}];
                }
            };

            $scope.calendarView = function () {
                $scope.view = CALENDAR_VIEW;
                $state.view = $scope.view;
            };

            $scope.listView = function () {
                $scope.view = 'List View';
                $state.view = $scope.view;
            };

            $scope.providerView = function (providerToggle) {
                $rootScope.providerToggle = providerToggle;
                $rootScope.$broadcast("event:providerView", providerToggle);
            };

            var getBackGroundHSLColorFor = function (otCalendarColorAttribute) {
                var hue = otCalendarColorAttribute && otCalendarColorAttribute.value ? otCalendarColorAttribute.value.toString() : "0";
                return "hsl(" + hue + ", 100%, 90%)";
            };

            $scope.isFilterApplied = function () {
                return Object.keys($state.filterParams.locations).length != $scope.locations.length
                        || !_.isEmpty($state.filterParams.providers)
                        || !_.isEmpty($state.filterParams.patient)
                        || !_.isEmpty($state.filterParams.statusList);
            };

            $scope.applyFilters = function () {
                $scope.filterParams = _.cloneDeep($scope.filters);
                $state.filterParams = $scope.filterParams;
            };

            $scope.clearFilters = function () {
                addLocationsForFilters();
                $scope.filters.providers = [];
                $scope.filters.statusList = [];
                $scope.patient = "";
                $scope.filters.patient = null;
                removeFreeTextItem();

                $scope.applyFilters();
            };

            var removeFreeTextItem = function () {
                $("input.input")[0].value = "";
                $("input.input")[1].value = "";
            };

            $scope.search = function () {
                return patientService.search($scope.patient).then(function (response) {
                    return response.data.pageOfResults;
                });
            };

            $scope.onSelectPatient = function (data) {
                $scope.filters.patient = data;
                if ($scope.view === CALENDAR_VIEW) {
                    if (_.isEmpty($scope.filters.statusList)) {
                        $scope.filters.statusList = [{name: Bahmni.OT.Constants.scheduled}, {name: Bahmni.OT.Constants.completed}];
                    }
                }
            };

            $scope.clearThePatientFilter = function () {
                $scope.filters.patient = null;
            };

            $scope.responseMap = function (data) {
                return _.map(data, function (patientInfo) {
                    patientInfo.label = patientInfo.givenName + " " + patientInfo.familyName + " " + "(" + patientInfo.identifier + ")";
                    return patientInfo;
                });
            };

            $scope.goToNewSurgicalAppointment = function () {
                var options = {};
                options['dashboardCachebuster'] = Math.random();
                $state.go("newSurgicalAppointment", options);
            };

            $scope.goToPreviousDate = function (date) {
                $scope.viewDate = Bahmni.Common.Util.DateUtil.subtractDays(date, 1);
                $state.viewDate = $scope.viewDate;
            };

            $scope.goToCurrentDate = function () {
                $scope.viewDate = moment().startOf('day').toDate();
                $state.viewDate = $scope.viewDate;
                $scope.weekOrDay = 'day';
                $state.weekOrDay = $scope.weekOrDay;

                $scope.weekStartDate = Bahmni.Common.Util.DateUtil.getWeekStartDate(currentDate, $scope.startOfWeekCode);
                $state.weekStartDate = $scope.weekStartDate;
            };

            $scope.goToNextDate = function (date) {
                $scope.viewDate = Bahmni.Common.Util.DateUtil.addDays(date, 1);
                $state.viewDate = $scope.viewDate;
            };

            $scope.goToSelectedDate = function (date) {
                $scope.viewDate = date;
                $state.viewDate = $scope.viewDate;
            };

            $scope.goToCurrentWeek = function () {
                $scope.weekStartDate = Bahmni.Common.Util.DateUtil.getWeekStartDate(currentDate, $scope.startOfWeekCode);
                $state.weekStartDate = $scope.weekStartDate;
                $scope.weekEndDate = Bahmni.Common.Util.DateUtil.getWeekEndDate($scope.weekStartDate);
                $state.weekEndDate = $scope.weekEndDate;
                $scope.weekOrDay = 'week';
                $state.weekOrDay = $scope.weekOrDay;

                $scope.viewDate = moment().startOf('day').toDate();
                $state.viewDate = $scope.viewDate;
            };

            $scope.goToNextWeek = function () {
                $scope.weekStartDate = Bahmni.Common.Util.DateUtil.addDays($scope.weekStartDate, 7);
                $scope.weekEndDate = Bahmni.Common.Util.DateUtil.addDays($scope.weekEndDate, 7);
                $state.weekStartDate = $scope.weekStartDate;
                $state.weekEndDate = $scope.weekEndDate;
            };

            $scope.goToPreviousWeek = function () {
                $scope.weekStartDate = Bahmni.Common.Util.DateUtil.subtractDays($scope.weekStartDate, 7);
                $scope.weekEndDate = Bahmni.Common.Util.DateUtil.subtractDays($scope.weekEndDate, 7);
                $state.weekStartDate = $scope.weekStartDate;
                $state.weekEndDate = $scope.weekEndDate;
            };

            $scope.goToSelectedWeek = function (date) {
                $scope.weekStartDate = date;
                $scope.weekEndDate = Bahmni.Common.Util.DateUtil.addDays($scope.weekStartDate, 7);
                $state.weekStartDate = $scope.weekStartDate;
                $state.weekEndDate = $scope.weekEndDate;
            };

            $scope.$on("event:surgicalAppointmentSelect", function (event, surgicalAppointment, surgicalBlock) {
                $scope.cancelDisabled = !(surgicalAppointment.status === Bahmni.OT.Constants.scheduled);
                $scope.moveButtonDisabled = !(surgicalAppointment.status === Bahmni.OT.Constants.scheduled);
                $scope.editDisabled = !((surgicalAppointment.status === Bahmni.OT.Constants.scheduled) || (surgicalAppointment.status === Bahmni.OT.Constants.completed));
                $scope.addActualTimeDisabled = !((surgicalAppointment.status === Bahmni.OT.Constants.scheduled) || (surgicalAppointment.status === Bahmni.OT.Constants.completed));
                $scope.surgicalAppointmentSelected = surgicalAppointment;
                $scope.surgicalBlockSelected = surgicalBlock;
                isCalendarView() && ngDialog.open({
                    template: 'views/surgicalAppointmentDialog.html',
                    className: 'ngdialog-theme-default',
                    closeByNavigation: true,
                    preCloseCallback: nullifySurgicalBlockData,
                    scope: $scope,
                    data: surgicalAppointment
                });
            });

            var isCalendarView = function () {
                return $scope.view === CALENDAR_VIEW;
            };

            $scope.$on("event:surgicalBlockSelect", function (event, surgicalBlock) {
                $scope.editDisabled = false;
                $scope.moveButtonDisabled = true;
                $scope.addActualTimeDisabled = true;
                $scope.cancelDisabled = true;
                $scope.surgicalBlockSelected = surgicalBlock;
                $scope.surgicalAppointmentSelected = {};
                $scope.showEndDate = (Bahmni.Common.Util.DateUtil.diffInDaysRegardlessOfTime(surgicalBlock.startDatetime, surgicalBlock.endDatetime) != 0);

                var surgicalBlockWithCompletedAppointments = function () {
                    return _.find(surgicalBlock.surgicalAppointments, function (appointment) {
                        return appointment.status === Bahmni.OT.Constants.completed;
                    });
                };

                if (!surgicalBlockWithCompletedAppointments()) {
                    $scope.cancelDisabled = false;
                }
                ngDialog.open({
                    template: 'views/surgicalBlockDialog.html',
                    className: 'ngdialog-theme-default',
                    closeByNavigation: true,
                    preCloseCallback: nullifySurgicalBlockData,
                    scope: $scope,
                    data: surgicalBlock
                });
            });

            var nullifySurgicalBlockData = function () {
                $scope.editDisabled = true;
                $scope.cancelDisabled = true;
                $scope.moveButtonDisabled = true;
                $scope.addActualTimeDisabled = true;
                $scope.surgicalBlockSelected = {};
                $scope.surgicalAppointmentSelected = {};
                $scope.showEndDate = false;
            };

            $scope.$on("event:surgicalBlockDeselect", function (event) {
                nullifySurgicalBlockData();
            });

            $scope.goToEdit = function ($event) {
                if (Object.keys($scope.surgicalBlockSelected).length !== 0) {
                    var options = {
                        surgicalBlockUuid: $scope.surgicalBlockSelected.uuid
                    };
                    if (Object.keys($scope.surgicalAppointmentSelected).length !== 0) {
                        options['surgicalAppointmentId'] = $scope.surgicalAppointmentSelected.id;
                    }
                    options['dashboardCachebuster'] = Math.random();
                    $state.go("editSurgicalAppointment", options);
                    $event.stopPropagation();
                }
            };

            $scope.gotoMove = function () {
                var cancelSurgicalBlockDialog = ngDialog.open({
                    template: "views/moveAppointment.html",
                    closeByDocument: false,
                    controller: "moveSurgicalAppointmentController",
                    className: "ngdialog-theme-default ot-dialog",
                    showClose: true,
                    data: {
                        surgicalBlock: $scope.surgicalBlockSelected,
                        surgicalAppointment: $scope.surgicalAppointmentSelected
                    }
                });
                closeSubsequentActiveDialogs(cancelSurgicalBlockDialog);
            };

            $scope.addActualTime = function () {
                ngDialog.open({
                    template: "views/addActualTimeDialog.html",
                    closeByDocument: false,
                    controller: "surgicalAppointmentActualTimeController",
                    className: 'ngdialog-theme-default ot-dialog',
                    showClose: true,
                    data: {
                        surgicalBlock: $scope.surgicalBlockSelected,
                        surgicalAppointment: $scope.surgicalAppointmentSelected
                    }
                });
            };

            var cancelSurgicalAppointment = function () {
                ngDialog.open({
                    template: "views/cancelAppointment.html",
                    closeByDocument: false,
                    controller: "calendarViewCancelAppointmentController",
                    className: 'ngdialog-theme-default ot-dialog',
                    showClose: true,
                    data: {
                        surgicalBlock: $scope.surgicalBlockSelected,
                        surgicalAppointment: $scope.surgicalAppointmentSelected
                    }
                });
            };

            var cancelSurgicalBlock = function () {
                var cancelSurgicalBlockDialog = ngDialog.open({
                    template: "views/cancelSurgicalBlock.html",
                    closeByDocument: false,
                    controller: "cancelSurgicalBlockController",
                    className: 'ngdialog-theme-default ot-dialog',
                    showClose: true,
                    data: {
                        surgicalBlock: $scope.surgicalBlockSelected,
                        provider: $scope.surgicalBlockSelected.provider.person.display
                    }
                });
                closeSubsequentActiveDialogs(cancelSurgicalBlockDialog);
            };

            var closeSubsequentActiveDialogs = function (currentDialog) {
                currentDialog.closePromise.then(function () {
                    ngDialog.close();
                });
            };

            $scope.minimizeFilter = function () {
                $scope.isFilterOpen = false;
            };

            $scope.expandFilter = function () {
                $scope.isFilterOpen = true;
            };

            function getLocationNames () {
                return _.map($scope.locations, function (location) {
                    return location.name;
                });
            }

            function isAnyLocationDeselected () {
                if ($scope.filters.locations) {
                    var locationNames = getLocationNames();
                    return _.some(locationNames, function (loc) {
                        return !$scope.filters.locations[loc];
                    });
                } return false;
            }

            function isAnyFilterOtherThanLocationsSelected () {
                return !(_.isEmpty($scope.filters.providers) && _.isEmpty($scope.filters.patient) && _.isEmpty($scope.filters.statusList));
            }

            $scope.isFilterApplied = function () {
                return isAnyFilterOtherThanLocationsSelected() || isAnyLocationDeselected();
            };

            $scope.cancelSurgicalBlockOrSurgicalAppointment = function () {
                if (!_.isEmpty($scope.surgicalAppointmentSelected)) {
                    cancelSurgicalAppointment();
                } else {
                    cancelSurgicalBlock();
                }
            };

            $scope.getAttributes = function (surgicalAppointment) {
                return surgicalAppointmentHelper.getSurgicalAttributes(surgicalAppointment);
            };

            $scope.getPatientDisplayLabel = function (surgicalAppointment) {
                return surgicalAppointmentHelper.getPatientDisplayLabel(surgicalAppointment.patient.display);
            };

            init();

            $scope.$watch('view', function (newValue, oldValue) {
                if (oldValue !== newValue) {
                    if (newValue === CALENDAR_VIEW) {
                        setAppointmentStatusList(newValue);
                        $scope.filters.statusList = _.filter($scope.filters.statusList, function (status) {
                            return status.name === Bahmni.OT.Constants.scheduled || status.name === Bahmni.OT.Constants.completed;
                        });
                    }
                    if (newValue === 'List View') {
                        setAppointmentStatusList(newValue);
                    }
                    $scope.applyFilters();
                }
            });
        }]);
