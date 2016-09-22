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
