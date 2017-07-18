'use strict';

angular.module('bahmni.appointments')
    .directive('serviceAvailability', ['appService', function (appService) {
        var states = {NEW: 0, EDIT: 1, READONLY: 2};

        var link = function (scope) {
            var init = function () {
                scope.availability = scope.availability || {};
                scope.startOfWeek = appService.getAppDescriptor().getConfigValue('startOfWeek');
            };

            scope.add = function () {
                scope.availabilityList.push(scope.availability);
                scope.availability = {};
                scope.onAddAvailability();
            };

            scope.isValid = function () {
                return scope.availability.startTime &&
                    scope.availability.endTime &&
                    _.find(scope.availability.days, {isSelected: true});
            };

            scope.delete = function () {
                var index = scope.availabilityList.indexOf(scope.availability);
                scope.availabilityList.splice(index, 1);
            };

            scope.cancel = function () {
                scope.availability = scope.backUpAvailability;
                scope.state = states.READONLY;
            };

            scope.enableEdit = function () {
                scope.backUpAvailability = scope.availability;
                scope.availability = angular.copy(scope.availability);
                scope.state = states.EDIT;
            };

            scope.update = function () {
                var index = scope.availabilityList.indexOf(scope.backUpAvailability);
                scope.availabilityList[index] = scope.availability;
                scope.state = states.READONLY;
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
                onAddAvailability: '&?'
            },
            link: link,
            templateUrl: '../appointments/views/admin/appointmentServiceAvailability.html'
        };
    }]);
