'use strict';

describe('SpecialityService', function () {
    var specialityService, mockHttp;
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
        inject(['specialityService', function (_specialityService_) {
            specialityService = _specialityService_;
        }]);
    });

    it('should get all specialities', function () {
        specialityService.getAllSpecialities();
        expect(mockHttp.get).toHaveBeenCalledWith(Bahmni.Appointments.Constants.getAllSpecialitiesUrl,
            jasmine.any(Object));
    });
});

