'use strict';

describe('AppointmentsService', function () {
    var appointmentsService, mockHttp;

    beforeEach(function () {
        module('bahmni.appointments');
    });

    beforeEach(module(function ($provide) {
        mockHttp = jasmine.createSpyObj('$http', ['get', 'post']);
        mockHttp.get.and.returnValue(specUtil.simplePromise({}));
        mockHttp.post.and.returnValue(specUtil.simplePromise({}));
        $provide.value('$http', mockHttp);
    }));
    beforeEach(inject(['appointmentsService', function (appointmentsServiceInjected) {
        appointmentsService = appointmentsServiceInjected;
    }]));

    it('should save the appointment', function () {
        var appointment = {};
        appointmentsService.save(appointment);
        var headers = {"Accept": "application/json", "Content-Type": "application/json"};
        var params = {withCredentials: true, headers: headers};
        expect(mockHttp.post).toHaveBeenCalledWith(Bahmni.Appointments.Constants.createAppointmentUrl, appointment, params);
    });

    it('should search for appointments with given info', function () {
        var appointmentInfo = {};
        appointmentsService.search(appointmentInfo);
        var headers = {"Accept": "application/json", "Content-Type": "application/json"};
        var params = {withCredentials: true, headers: headers};
        expect(mockHttp.post).toHaveBeenCalledWith(Bahmni.Appointments.Constants.searchAppointmentUrl, appointmentInfo, params);
    });

    // it('should get all the appointments against the given service type', function () {
    //     var serviceTypeUuid = "serviceTypeUuid";
    //     appointmentsService.getAppointmentsForServiceType(serviceTypeUuid);
    //     var headers = {"Accept": "application/json", "Content-Type": "application/json"};
    //     var params = {appointmentServiceTypeUuid: serviceTypeUuid, withCredentials: true, headers: headers};
    //     console.log("calls", mockHttp.get.calls.count());
    //     console.log("calls", mockHttp.get.calls.mostRecent);
    //     expect(mockHttp.get).toHaveBeenCalledWith(Bahmni.Appointments.Constants.createAppointmentUrl, params);
    // });
});
