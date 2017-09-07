'use strict';

describe('AppointmentsServiceService', function () {
    var appointmentsServiceService, mockHttp;
    mockHttp = jasmine.createSpyObj('$http', ['get', 'post', 'delete']);
    mockHttp.get.and.callFake(function (params) {
        return specUtil.respondWith({data: {}});
    });
    mockHttp.post.and.callFake(function (params) {
        return specUtil.respondWith({data: {}});
    });

    beforeEach(function () {
        module('bahmni.appointments');
        module(function ($provide) {
            $provide.value('$http', mockHttp);
        });
        inject(['appointmentsServiceService', function (_appointmentsServiceService_) {
            appointmentsServiceService = _appointmentsServiceService_;
        }]);
    });

    it('should post service data on save', function () {
        appointmentsServiceService.save();
        expect(mockHttp.post).toHaveBeenCalled();
    });

    it('should get service load', function () {
        var serviceUuid = "serviceUuid";
        var headers = {Accept: 'application/json', 'Content-Type': 'application/json'};
        var params = {params: {uuid: serviceUuid, startDateTime: "startTime", endDateTime: "endTime"}, withCredentials: true, headers: headers};
        appointmentsServiceService.getServiceLoad(serviceUuid, "startTime", "endTime");
        expect(mockHttp.get).toHaveBeenCalledWith(Bahmni.Appointments.Constants.getServiceLoad, params);
    });

    it('should delete the appointment service', function () {
        var serviceUuid = "serviceUuid";
        appointmentsServiceService.deleteAppointmentService(serviceUuid);
        var headers = {Accept: 'application/json', 'Content-Type': 'application/json'};
        var params = {params: {uuid: serviceUuid}, withCredentials: true, headers: headers};
        expect(mockHttp.delete).toHaveBeenCalledWith('/openmrs/ws/rest/v1/appointmentService', params);
    });

    it("should get appointment services with speciality and service types", function () {
       appointmentsServiceService.getAllServicesWithServiceTypes();
        var headers = {Accept: 'application/json', 'Content-Type': 'application/json'};
        var params = { withCredentials: true, headers: headers};
        expect(mockHttp.get).toHaveBeenCalledWith('/openmrs/ws/rest/v1/appointmentService/all/full', params);
    });

    it("should get all appointment services with default response", function () {
        appointmentsServiceService.getAllServices();
        var headers = {Accept: 'application/json', 'Content-Type': 'application/json'};
        var params = { withCredentials: true, headers: headers};
        expect(mockHttp.get).toHaveBeenCalledWith('/openmrs/ws/rest/v1/appointmentService/all/default', params);
    });
});
