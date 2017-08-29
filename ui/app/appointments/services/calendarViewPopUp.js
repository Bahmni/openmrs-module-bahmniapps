'use strict';

angular.module('bahmni.common.uiHelper')
    .service('calendarViewPopUp', ['$rootScope', 'ngDialog', function ($rootScope, ngDialog) {
        var calendarViewPopUp = function (config) {
            var popUpScope = $rootScope.$new();
            popUpScope.close = function () {
                ngDialog.close();
                popUpScope.$destroy();
            };
            var scope = config.scope;
            scope.patientList = scope.appointments.map(function (appt) {
                return appt.patient;
            });

            scope.patientAppointmentMap = scope.appointments.reduce(function (result, appt) {
                result[appt.patient.uuid] = appt;
                return result;
            }, {});

            popUpScope.scope = scope;
            popUpScope.patient = scope.patientList.length === 1 ? scope.patientList[0] : undefined;

            ngDialog.open({
                template: '../appointments/views/manage/calendar/popUp.html',
                scope: popUpScope,
                className: config.className || 'ngdialog-theme-default'
            });
        };
        return calendarViewPopUp;
    }]);
