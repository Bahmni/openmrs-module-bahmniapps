'use strict';

describe('AppointmentInitialization', function () {
    var appointmentInitialization, appointmentsService, $stateParams;

    beforeEach(function () {
        appointmentsService = jasmine.createSpyObj('appointmentsService', ['getAppointmentByUuid']);
        $stateParams = {};
    });

    beforeEach(module('bahmni.appointments', function ($provide) {
        $provide.value('appointmentsService', appointmentsService);
    }));

    beforeEach(function () {
        inject(['appointmentInitialization', function (_appointmentInitialization_) {
            appointmentInitialization = _appointmentInitialization_;
        }]);
    });

    it('should return empty object if stateParams is Empty', function () {
        var appointment = appointmentInitialization($stateParams);
        expect(appointment).toEqual({});
    });

    it('should return appointment object if stateParams has appointment', function () {
        var appointment = {provider: {name: 'Superman'}};
        $stateParams = {appointment: appointment, isFilterOpen: false};
        var result = appointmentInitialization($stateParams);
        expect(result).toEqual({appointment: appointment});
    });

    it('should return appointment if stateParams has uuid', function () {
        var uuid = '7d162c29-3f12-11e4-adec-0800271c1b75';
        var appointment = {uuid: uuid, patient: {
            identifier: 'GAN203010',
            name: 'test patient',
            uuid: 'a5225d4e-d142-45a3-844c-3d6661dd79c3'
        }};
        appointmentsService.getAppointmentByUuid.and.returnValue(specUtil.simplePromise({data: appointment}));
        $stateParams = {uuid: uuid, isFilterOpen: false};
        appointmentInitialization($stateParams).then(function (result) {
            expect(appointmentsService.getAppointmentByUuid).toHaveBeenCalledWith(uuid);
            expect(result).toEqual({appointment: appointment});
        });
    });
});
