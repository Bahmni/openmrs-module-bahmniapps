'use strict';

angular.module('bahmni.appointments')
    .directive('serviceAvailability', ['appService', 'confirmBox', function (appService, confirmBox) {
        var states = {NEW: 0, EDIT: 1, READONLY: 2};

        var constDays = [{
            dayOfWeek: 'SUNDAY',
            isSelected: false
        }, {
            dayOfWeek: 'MONDAY',
            isSelected: false
        }, {
            dayOfWeek: 'TUESDAY',
            isSelected: false
        }, {
            dayOfWeek: 'WEDNESDAY',
            isSelected: false
        }, {
            dayOfWeek: 'THURSDAY',
            isSelected: false
        }, {
            dayOfWeek: 'FRIDAY',
            isSelected: false
        }, {
            dayOfWeek: 'SATURDAY',
            isSelected: false
        }];

        var link = function (scope) {
            var init = function () {
                scope.availability = scope.availability || {};
                scope.startOfWeek = Bahmni.Appointments.Constants.weekDays[appService.getAppDescriptor().getConfigValue('startOfWeek')] + 1
                    || 1;
            };

            scope.add = function () {
                if (addOrUpdateToIndex(scope.availabilityList.length)) {
                    scope.availability = {days: angular.copy(constDays)};
                }
            };

            scope.clearValueIfInvalid = function () {
                if (scope.availability.maxAppointmentsLimit < 0) {
                    scope.availability.maxAppointmentsLimit = '';
                }
            };

            scope.update = function () {
                var index = scope.availabilityList.indexOf(scope.backUpAvailability);
                if (addOrUpdateToIndex(index)) {
                    scope.state = states.READONLY;
                }
            };

            var addOrUpdateToIndex = function (index) {
                scope.doesOverlap = overlapsWithExisting(index);
                if (!scope.doesOverlap) {
                    scope.availabilityList[index] = scope.availability;
                }
                return !scope.doesOverlap;
            };

            scope.isValid = function () {
                var startTime = scope.availability.startTime;
                var endTime = scope.availability.endTime;
                return startTime &&
                       endTime && startTime < endTime &&
                        convertDaysToBinary(scope.availability.days);
            };

            var overlapsWithExisting = function (index) {
                var avb = scope.availability;
                return !_.isEmpty(scope.availabilityList) && _.some(scope.availabilityList, function (currAvb, currIndex) {
                    if (index !== currIndex) {
                        return hasCommonDays(avb, currAvb) && hasOverlappingTimes(avb, currAvb);
                    }
                });
            };

            var convertDaysToBinary = function (days) {
                return parseInt(days.map(function (day) {
                    return day.isSelected ? 1 : 0;
                }).reverse().join(''), 2);
            };

            var hasCommonDays = function (avb1, avb2) {
                var days1InBinary = convertDaysToBinary(avb1.days);
                var days2InBinary = convertDaysToBinary(avb2.days);
                return (days1InBinary & days2InBinary) !== 0;
            };

            var hasOverlappingTimes = function (avb1, avb2) {
                return (avb1.startTime < avb2.endTime) && (avb2.startTime < avb1.endTime);
            };

            scope.confirmDelete = function () {
                var childScope = {};
                childScope.message = 'CONFIRM_DELETE_AVAILABILITY';
                childScope.ok = deleteAvailability;
                childScope.cancel = cancelDelete;
                confirmBox({
                    scope: childScope,
                    actions: [{name: 'cancel', display: 'CANCEL_KEY'}, {name: 'ok', display: 'OK_KEY'}],
                    className: "ngdialog-theme-default delete-program-popup"
                });
            };

            var deleteAvailability = function (closeDialog) {
                var index = scope.availabilityList.indexOf(scope.availability);
                scope.availabilityList.splice(index, 1);
                closeDialog();
            };

            var cancelDelete = function (closeDialog) {
                closeDialog();
            };

            scope.cancel = function () {
                scope.availability = scope.backUpAvailability;
                scope.doesOverlap = false;
                scope.state = states.READONLY;
            };

            scope.enableEdit = function () {
                scope.backUpAvailability = scope.availability;
                scope.availability = angular.copy(scope.availability);
                scope.state = states.EDIT;
            };

            scope.isNew = function () {
                return scope.state === states.NEW;
            };

            scope.isEdit = function () {
                return scope.state === states.EDIT;
            };

            scope.isReadOnly = function () {
                return scope.state === states.READONLY;
            };

            init();
        };

        return {
            restrict: 'AE',
            scope: {
                availability: '=?',
                availabilityList: '=',
                state: '=',
                disableMaxLoad: '='
            },
            link: link,
            templateUrl: '../appointments/views/admin/appointmentServiceAvailability.html'
        };
    }]);
