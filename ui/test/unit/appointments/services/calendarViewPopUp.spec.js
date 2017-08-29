'use strict';

describe('CalendarViewPopUp', function () {
    var rootScope, calendarViewPopUp, popUpScope, ngDialog;

    beforeEach(function () {
        module('bahmni.appointments');
        module(function ($provide) {
            popUpScope = {$destroy: function () {
            }};
            ngDialog = jasmine.createSpyObj('ngDialog', ['open', 'close']);
            $provide.value('ngDialog', ngDialog);
        });
    });

    beforeEach(inject(['$rootScope', 'calendarViewPopUp',function($rootScope, _calendarViewPopUp_) {
        rootScope = $rootScope;
        calendarViewPopUp = _calendarViewPopUp_;
    }]));

    beforeEach(function () {
        spyOn(rootScope, '$new');
        rootScope.$new.and.returnValue(popUpScope);
    });

    it('construct patients list and group appointments by patients', function () {
        var appointments = [
            {
                patient: {identifier: "GAN203012", name: "patient1", uuid: "03dba27a-dbd3-464a-8713-24345aa51e1e"}
            },
            {
                patient: {identifier: "GAN102018", name: "patient2", uuid: "96a2b38c-18d8-4603-94cd-e2f806251870"}
            }
        ];
        var config = {scope: {appointments: appointments}};
        calendarViewPopUp(config);
        expect(popUpScope.scope.patientList).toEqual([appointments[0].patient, appointments[1].patient]);
        expect(popUpScope.scope.patientAppointmentMap[appointments[0].patient.uuid]).toBe(appointments[0]);
        expect(popUpScope.scope.patientAppointmentMap[appointments[1].patient.uuid]).toBe(appointments[1]);
        expect(popUpScope.patient).toBeUndefined();
    });

    it('should assign patient when there is a single appointment', function () {
        var appointments = [
            {
                patient: {identifier: "GAN203012", name: "patient1", uuid: "03dba27a-dbd3-464a-8713-24345aa51e1e"}
            }
        ];
        var config = {scope: {appointments: appointments}};
        calendarViewPopUp(config);
        expect(popUpScope.patient).toBe(appointments[0].patient);
    });

    it('should open ngDialog with properties', function () {
        var config = {scope: {appointments: []}};
        calendarViewPopUp(config);
        expect(ngDialog.open).toHaveBeenCalledWith({
            template: '../appointments/views/manage/calendar/popUp.html',
            scope: popUpScope,
            className: 'ngdialog-theme-default'
        });
    });

    it('should close ngDialog on popUp close', function () {
        var config = {scope: {appointments: []}};
        calendarViewPopUp(config);
        popUpScope.close();
        expect(ngDialog.close).toHaveBeenCalled();
    })

});
