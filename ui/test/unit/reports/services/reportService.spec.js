/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

describe('Report Service', function () {
    var mockAppService, mockBahmniCookieStore, reportService, mockHttp;

    beforeEach(function () {
        mockAppService = jasmine.createSpyObj('appService', ["getAppDescriptor", "getAppName"]);
        mockBahmniCookieStore = jasmine.createSpyObj('bahmniCookieStore', ["get"]);
        mockHttp = {
            get: jasmine.createSpy('get').and.returnValue({})
        };
        module('bahmni.reports');
        module(function ($provide) {
            $provide.value('appService', mockAppService);
            $provide.value('$bahmniCookieStore', mockBahmniCookieStore);
            $provide.value('$http', mockHttp);
        });
        //TODO: Fix error caused by $bahmniTranslateProvider while injecting the service
        // inject(function (_reportService_) {
        //     reportService = _reportService_;
        // });
    });

    it("abdc", function () {
    })
});
