'use strict';

describe("Provider Service",function () {
    var providerService, mockHttp;
    mockHttp = jasmine.createSpyObj('$http', ['get']);
    mockHttp.get.and.callFake(function (params) {
        return specUtil.respondWith({data: {}});
    });

    beforeEach(function () {
        module('bahmni.common.domain');
        module(function ($provide) {
            $provide.value('$http', mockHttp);
        });
        inject(['providerService', function (_providerService_) {
            providerService = _providerService_;
        }]);
    });

    it("should call http get with no params",function () {
        var params = { method : 'GET', cache : false, params : {} };
        providerService.list({});
        expect(mockHttp.get).toHaveBeenCalledWith(Bahmni.Common.Constants.providerUrl, params)
    })

    it("should call http get with custom params",function () {
        var customParams = {v: "custom:(display,person,uuid)"};
        var params = { method : 'GET', cache : false, params : customParams };
        providerService.list(customParams);
        expect(mockHttp.get).toHaveBeenCalledWith(Bahmni.Common.Constants.providerUrl, params)
    })
});