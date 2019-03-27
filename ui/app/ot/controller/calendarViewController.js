'use strict';

angular.module('bahmni.ot')
    .controller('calendarViewController', ['$scope', '$rootScope', '$state', '$stateParams', 'appService', 'patientService', 'locationService', 'ngDialog',
        function ($scope, $rootScope, $state, $stateParams, appService, patientService, locationService, ngDialog) {
            $scope.viewDate = $stateParams.viewDate || $state.viewDate || (moment().startOf('day')).toDate();
            $state.viewDate = $scope.viewDate;
            $scope.calendarConfig = appService.getAppDescriptor().getConfigValue("calendarView");

            var addLocationsForFilters = function () {
                var locations = {};
                _.each($scope.locations, function (location) {
                    locations[location.name] = true;
                });
                $scope.filters.locations = locations;
            };

            var init = function () {
                $scope.filterParams = $state.filterParams;
                $scope.filters = {};
                $scope.filters.providers = [];
                $scope.view = $state.view || 'Calendar';
                $state.view = $scope.view;
                $scope.weekOrDay = $state.weekOrDay || 'day';
                $state.weekOrDay = $scope.weekOrDay;
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
                setAppointmentStatusList($scope.view);
                return locationService.getAllByTag('Operation Theater').then(function (response) {
                    $scope.locations = response.data.results;
                    addLocationsForFilters();
                    $scope.filters = $scope.filterParams || $scope.filters;
                    $scope.patient = $scope.filters.patient && $scope.filters.patient.value;
                    $scope.applyFilters();
                    return $scope.locations;
                });
            };

            var setAppointmentStatusList = function (view) {
                if (view === 'Calendar') {
                    $scope.appointmentStatusList = [{name: Bahmni.OT.Constants.scheduled}, {name: Bahmni.OT.Constants.completed}];
                } else {
                    $scope.appointmentStatusList = [{name: Bahmni.OT.Constants.scheduled}, {name: Bahmni.OT.Constants.completed},
                        {name: Bahmni.OT.Constants.postponed}, {name: Bahmni.OT.Constants.cancelled}];
                }
            };

            $scope.calendarView = function () {
                $scope.weekOrDay = 'day';
                $state.weekOrDay = $scope.weekOrDay;
                $scope.view = 'Calendar';
                $state.view = $scope.view;
            };

            $scope.listView = function () {
                $scope.view = 'List View';
                $state.view = $scope.view;
            };

            var getBackGroundHSLColorFor = function (otCalendarColorAttribute) {
                var hue = otCalendarColorAttribute ? otCalendarColorAttribute.value.toString() : "0";
                return "hsl(" + hue + ", 100%, 90%)";
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
                if ($scope.view === 'Calendar') {
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
                $scope.viewDate = new Date(moment().startOf('day'));
                $state.viewDate = $scope.viewDate;
                $scope.weekOrDay = 'day';
                $state.weekOrDay = $scope.weekOrDay;
            };

            $scope.goToNextDate = function (date) {
                $scope.viewDate = Bahmni.Common.Util.DateUtil.addDays(date, 1);
                $state.viewDate = $scope.viewDate;
            };

            $scope.goToCurrentWeek = function () {
                $scope.weekStartDate = new Date(moment().startOf('week'));
                $state.weekStartDate = $scope.weekStartDate;
                $scope.weekEndDate = new Date(moment().endOf('week').endOf('day'));
                $state.weekEndDate = $scope.weekEndDate;
                $scope.weekOrDay = 'week';
                $state.weekOrDay = $scope.weekOrDay;
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

            $scope.$on("event:surgicalAppointmentSelect", function (event, surgicalAppointment, surgicalBlock) {
                $scope.cancelDisabled = !(surgicalAppointment.status === Bahmni.OT.Constants.scheduled);
                $scope.moveButtonDisabled = !(surgicalAppointment.status === Bahmni.OT.Constants.scheduled);
                $scope.editDisabled = !((surgicalAppointment.status === Bahmni.OT.Constants.scheduled) || (surgicalAppointment.status === Bahmni.OT.Constants.completed));
                $scope.addActualTimeDisabled = !((surgicalAppointment.status === Bahmni.OT.Constants.scheduled) || (surgicalAppointment.status === Bahmni.OT.Constants.completed));
                $scope.surgicalAppointmentSelected = surgicalAppointment;
                $scope.surgicalBlockSelected = surgicalBlock;
            });

            $scope.$on("event:surgicalBlockSelect", function (event, surgicalBlock) {
                $scope.editDisabled = false;
                $scope.moveButtonDisabled = true;
                $scope.addActualTimeDisabled = true;
                $scope.surgicalBlockSelected = surgicalBlock;
                $scope.surgicalAppointmentSelected = {};

                var surgicalBlockWithCompletedAppointments = function () {
                    return _.find(surgicalBlock.surgicalAppointments, function (appointment) {
                        return appointment.status === Bahmni.OT.Constants.completed;
                    });
                };

                if (!surgicalBlockWithCompletedAppointments()) {
                    $scope.cancelDisabled = false;
                }
            });

            $scope.$on("event:surgicalBlockDeselect", function (event) {
                $scope.editDisabled = true;
                $scope.cancelDisabled = true;
                $scope.moveButtonDisabled = true;
                $scope.addActualTimeDisabled = true;
                $scope.surgicalBlockSelected = {};
                $scope.surgicalAppointmentSelected = {};
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
                ngDialog.open({
                    template: "views/moveAppointment.html",
                    closeByDocument: false,
                    controller: "moveSurgicalAppointmentController",
                    className: "ngdialog-theme-default ng-dialog-adt-popUp ot-dialog",
                    showClose: true,
                    data: {
                        surgicalBlock: $scope.surgicalBlockSelected,
                        surgicalAppointment: $scope.surgicalAppointmentSelected
                    }
                });
            };

            $scope.addActualTime = function () {
                ngDialog.open({
                    template: "views/addActualTimeDialog.html",
                    closeByDocument: false,
                    controller: "surgicalAppointmentActualTimeController",
                    className: 'ngdialog-theme-default ng-dialog-adt-popUp ot-dialog',
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
                    className: 'ngdialog-theme-default ng-dialog-adt-popUp ot-dialog',
                    showClose: true,
                    data: {
                        surgicalBlock: $scope.surgicalBlockSelected,
                        surgicalAppointment: $scope.surgicalAppointmentSelected
                    }
                });
            };

            var cancelSurgicalBlock = function () {
                ngDialog.open({
                    template: "views/cancelSurgicalBlock.html",
                    closeByDocument: false,
                    controller: "cancelSurgicalBlockController",
                    className: 'ngdialog-theme-default ng-dialog-adt-popUp ot-dialog',
                    showClose: true,
                    data: {
                        surgicalBlock: $scope.surgicalBlockSelected,
                        provider: $scope.surgicalBlockSelected.provider.person.display
                    }
                });
            };

            $scope.cancelSurgicalBlockOrSurgicalAppointment = function () {
                if (!_.isEmpty($scope.surgicalAppointmentSelected)) {
                    cancelSurgicalAppointment();
                } else {
                    cancelSurgicalBlock();
                }
            };
            init();

            $scope.$watch('view', function (newValue, oldValue) {
                if (oldValue !== newValue) {
                    if (newValue === 'Calendar') {
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
