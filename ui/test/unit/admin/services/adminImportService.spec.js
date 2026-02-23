/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


describe("adminImportService", function() {
    var adminImportService;
    var mockHttp = jasmine.createSpyObj('$http', ['get']);
    mockHttp.get.and.callFake(function(param) {
        return specUtil.respondWith("success");
    });

    beforeEach(function () {
        module('bahmni.admin');
        module(function ($provide) {
            $provide.value('$http', mockHttp);
        });

        inject(['adminImportService', function (adminImportServiceInjected) {
            adminImportService = adminImportServiceInjected;
        }]);
    });

    it('service should retrieve', function (done) {
        adminImportService.getAllStatus(12).then(function(response) {
            expect(response).toEqual("success");
            done();
        });
        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe("/openmrs/ws/rest/v1/bahmnicore/admin/upload/status");
        expect(mockHttp.get.calls.mostRecent().args[1].params).toEqual({numberOfDays:12});
    });
});