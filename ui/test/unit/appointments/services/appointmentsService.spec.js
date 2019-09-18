'use strict';

describe('AppointmentsService', function () {
    var appointmentsService, mockHttp, appService, appDescriptor;

    beforeEach(function () {
        module('bahmni.appointments');
    });

    beforeEach(module(function ($provide) {
        mockHttp = jasmine.createSpyObj('$http', ['get', 'post']);
        mockHttp.get.and.returnValue(specUtil.simplePromise({}));
        mockHttp.post.and.returnValue(specUtil.simplePromise({}));
        appDescriptor = jasmine.createSpyObj('appDescriptor', ['formatUrl']);
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appService.getAppDescriptor.and.returnValue(appDescriptor);
        $provide.value('$http', mockHttp);
        $provide.value('appService', appService);
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

    it('should search for appointments with given start date and end date', function () {
        var data = {startDate:"2018-09-07T18:30:00.000Z" , endDate:"2018-09-13T18:30:00.000Z"};
        appointmentsService.searchAppointments(data);
        var headers = {"Accept": "application/json", "Content-Type": "application/json"};
        var params = {withCredentials: true, headers: headers};
        expect(mockHttp.post).toHaveBeenCalledWith(Bahmni.Appointments.Constants.searchAppointmentsUrl, data, params);
    });

    it('should get all the appointments summary for all the service types', function () {
        var weekInfo = {
            startDate: moment().startOf('week').toDate(),
            endDate: moment().endOf('week').toDate()
        };
        appointmentsService.getAppointmentsSummary(weekInfo);
        var headers = {"Accept": "application/json", "Content-Type": "application/json"};
        var params = {params: weekInfo, withCredentials: true, headers: headers};
        expect(mockHttp.get).toHaveBeenCalledWith(Bahmni.Appointments.Constants.getAppointmentsSummaryUrl, params);
    });

    it('should get all the appointments for a service type', function () {
        var serviceTypeUuid = "serviceTypeUuid";
        appointmentsService.getAppointmentsForServiceType(serviceTypeUuid);
        var headers = {"Accept": "application/json", "Content-Type": "application/json"};
        var params = {params: {"appointmentServiceTypeUuid": serviceTypeUuid}, withCredentials: true, headers: headers};
        expect(mockHttp.get).toHaveBeenCalledWith(Bahmni.Appointments.Constants.getAppointmentsForServiceTypeUrl, params);
    });

    it('should get appointment by uuid', function () {
        var appointmentUuid = "7d162c29-3f12-11e4-adec-0800271c1b75";
        appointmentsService.getAppointmentByUuid(appointmentUuid);
        var headers = {"Accept": "application/json", "Content-Type": "application/json"};
        var params = {params: {"uuid": appointmentUuid}, withCredentials: true, headers: headers};
        expect(mockHttp.get).toHaveBeenCalledWith(Bahmni.Appointments.Constants.getAppointmentByUuid, params);
    });

    it('should change the status of the appointment', function () {
        var appointment = {status: 'Scheduled', uuid: "7d162c29-3f12-11e4-adec-0800271c1b75"};
        var toStatus = "CheckedIn";
        var onDate = new Date();
        var changeStatusUrl = Bahmni.Appointments.Constants.changeAppointmentStatusUrl;
        changeStatusUrl.replace('{{appointmentUuid}}', appointment.uuid);
        appDescriptor.formatUrl.and.returnValue(changeStatusUrl);
        appointmentsService.changeStatus(appointment, toStatus, onDate);
        var headers = {"Accept": "application/json", "Content-Type": "application/json"};
        var params = {withCredentials: true, headers: headers};
        expect(mockHttp.post).toHaveBeenCalledWith(changeStatusUrl, {'toStatus': toStatus, 'onDate': onDate},  params);
    });
});


