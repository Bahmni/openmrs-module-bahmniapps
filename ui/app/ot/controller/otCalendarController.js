'use strict';

angular.module('bahmni.ot')
    .controller('otCalendarController', ['$scope', '$q', 'spinner', 'locationService', 'surgicalAppointmentService', '$state', 'ngDialog',
        function ($scope, $q, spinner, locationService, surgicalAppointmentService, $state, ngDialog) {
            var init = function () {
                var dayStart = ($scope.dayViewStart || '00:00').split(':');
                var dayEnd = ($scope.dayViewEnd || '23:59').split(':');
                $scope.surgicalBlockSelected = {};
                $scope.surgicalAppointmentSelected = {};
                $scope.editDisabled = true;
                $scope.cancelDisabled = true;
                $scope.addActualTimeDisabled = true;
                $scope.dayViewSplit = parseInt($scope.dayViewSplit) > 0 ? parseInt($scope.dayViewSplit) : 60;
                $scope.calendarStartDatetime = Bahmni.Common.Util.DateUtil.addMinutes($scope.viewDate, (dayStart[0] * 60 + parseInt(dayStart[1])));
                $scope.calendarEndDatetime = Bahmni.Common.Util.DateUtil.addMinutes($scope.viewDate, (dayEnd[0] * 60 + parseInt(dayEnd[1])));
                $scope.rows = $scope.getRowsForCalendar();
                return $q.all([locationService.getAllByTag('Operation Theater'), surgicalAppointmentService.getSurgicalBlocksInDateRange($scope.calendarStartDatetime, $scope.calendarEndDatetime)]).then(function (response) {
                    $scope.locations = response[0].data.results;

                    $scope.surgicalBlocksByLocation = _.map($scope.locations, function (location) {
                        return _.filter(response[1].data.results, function (surgicalBlock) {
                            return surgicalBlock.location.uuid === location.uuid;
                        });
                    });
                });
            };

            $scope.intervals = function () {
                var dayStart = ($scope.dayViewStart || '00:00').split(':');
                var dayEnd = ($scope.dayViewEnd || '23:59').split(':');
                var noOfIntervals = ((dayEnd[0] * 60 + parseInt(dayEnd[1])) - (dayStart[0] * 60 + parseInt(dayStart[1]))) / $scope.dayViewSplit;
                return Math.ceil(noOfIntervals);
            };

            $scope.getRowsForCalendar = function () {
                var rows = [];
                for (var i = 0; i < $scope.intervals(); i++) {
                    var row = {
                        date: Bahmni.Common.Util.DateUtil.addMinutes($scope.calendarStartDatetime, i * ($scope.dayViewSplit))
                    };
                    rows.push(row);
                }
                return rows;
            };

            $scope.$watch("viewDate", function (oldValue, newValue) {
                if (oldValue.getTime() !== newValue.getTime()) {
                    spinner.forPromise(init());
                }
            });

            $scope.$on("event:surgicalAppointmentSelect", function (event, surgicalAppointment, surgicalBlock) {
                $scope.cancelDisabled = surgicalAppointment.status == 'COMPLETED';
                $scope.editDisabled = false;
                $scope.addActualTimeDisabled = false;
                $scope.surgicalAppointmentSelected = surgicalAppointment;
                $scope.surgicalBlockSelected = surgicalBlock;
            });

            $scope.$on("event:surgicalBlockSelect", function (event, surgicalBlock) {
                $scope.editDisabled = false;
                $scope.addActualTimeDisabled = true;
                $scope.surgicalBlockSelected = surgicalBlock;
                $scope.surgicalAppointmentSelected = {};

                var surgicalBlockWithCompletedAppointments = function () {
                    return _.find(surgicalBlock.surgicalAppointments, function (appointment) {
                        return appointment.status === Bahmni.OT.Constants.completed;
                    });
                };

                if (!surgicalBlockWithCompletedAppointments())
                    $scope.cancelDisabled = false;
            });

            $scope.$on("event:surgicalBlockDeselect", function (event) {
                $scope.editDisabled = true;
                $scope.cancelDisabled = true;
                $scope.addActualTimeDisabled = true;
                $scope.surgicalBlockSelected = {};
                $scope.surgicalAppointmentSelected = {};
            });

            $scope.goToEdit = function ($event) {
                if (Object.keys($scope.surgicalBlockSelected).length != 0) {
                    var options = {
                        surgicalBlockUuid: $scope.surgicalBlockSelected.uuid
                    };
                    if (Object.keys($scope.surgicalAppointmentSelected).length != 0) {
                        options['surgicalAppointmentId'] = $scope.surgicalAppointmentSelected.id;
                    }
                    options['dashboardCachebuster'] = Math.random();
                    $state.go("editSurgicalAppointment", options);
                    $event.stopPropagation();
                }
            };

            $scope.addActualTime = function () {
                ngDialog.open({
                    template: "views/addActualTimeDialog.html",
                    closeByDocument: false,
                    controller: "surgicalAppointmentActualTimeController",
                    className: 'ngdialog-theme-default ng-dialog-adt-popUp',
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
                    className: 'ngdialog-theme-default ng-dialog-adt-popUp',
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
                    className: 'ngdialog-theme-default ng-dialog-adt-popUp',
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
                }
                cancelSurgicalBlock();
            };

            spinner.forPromise(init());
        }]);
