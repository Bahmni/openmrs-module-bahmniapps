'use strict';

describe('AppointmentsServiceService', function () {
    var appointmentsServiceService, mockHttp;
    mockHttp = jasmine.createSpyObj('$http', ['get', 'post']);
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
});
