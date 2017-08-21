'use strict';

describe('AppointmentsListViewController', function () {
    var controller, scope, stateparams, spinner, appointmentsService, appService, appDescriptor;

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function ($controller, $rootScope, $stateParams) {
            scope = $rootScope.$new();
            controller = $controller;
            stateparams = $stateParams,
            appointmentsService = jasmine.createSpyObj('appointmentsService', ['getAllAppointments']);
            appointmentsService.getAllAppointments.and.returnValue(specUtil.simplePromise({}));
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            appDescriptor.getConfigValue.and.returnValue(true);
            spinner = jasmine.createSpyObj('spinner', ['forPromise']);
            spinner.forPromise.and.callFake(function () {
                return {
                    then: function () {
                        return {};
                    }
                };
            });
        });
    });

    var createController = function () {
        controller('AppointmentsListViewController', {
            $scope: scope,
            spinner: spinner,
            appointmentsService: appointmentsService,
            appService: appService,
            $stateParams: stateparams
        });
    };

    beforeEach(function () {
        createController();
    });

    it("should initialize today's date if not viewDate is provided in stateParams", function () {
        var today = moment().startOf('day').toDate();
        expect(scope.startDate).toEqual(today);
    });

    it('should initialize to viewDate in stateParams if provided', function () {
        stateparams = {
            viewDate: moment("2017-08-20").toDate()
        };
        createController();
        expect(scope.startDate).toEqual(stateparams.viewDate);
    });

    it("should initialize enable service types and enable specialities from config", function () {
        expect(scope.enableServiceTypes).toBeTruthy();
        expect(scope.enableSpecialities).toBeTruthy();
    });

    it('should get appointments for date', function () {
        var viewDate = new Date('1970-01-01T11:30:00.000Z');
        scope.getAppointmentsForDate(viewDate);
        expect(appointmentsService.getAllAppointments).toHaveBeenCalledWith({forDate: viewDate});
        expect(appointmentsService.selectedAppointment).toBeUndefined();
        expect(spinner.forPromise).toHaveBeenCalled();
    });

    it('should select an appointment', function () {
        var appointment1 = {patient: {name: 'patient1'}};
        var appointment2 = {patient: {name: 'patient2'}};
        scope.appointments = [appointment1, appointment2];
        scope.select(appointment2);
        expect(scope.selectedAppointment).toBe(appointment2);
        expect(scope.isSelected(scope.appointments[0])).toBeFalsy();
        expect(scope.isSelected(scope.appointments[1])).toBeTruthy();
    });

    it('should unselect an appointment if is selected', function () {
        var appointment1 = {patient: {name: 'patient1'}};
        var appointment2 = {patient: {name: 'patient2'}};
        scope.appointments = [appointment1, appointment2];
        scope.select(appointment2);
        expect(scope.selectedAppointment).toBe(appointment2);
        expect(scope.isSelected(scope.appointments[1])).toBeTruthy();
        scope.select(appointment2);
        expect(scope.selectedAppointment).toBeUndefined();
        expect(scope.isSelected(scope.appointments[1])).toBeFalsy();
    });
});
