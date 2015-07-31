'use strict';

describe('Order Service', function () {
    var orderService;
    var mockHttp = jasmine.createSpyObj('$http', ['get']);
    mockHttp.get.and.callFake(function(param) {
        return specUtil.respondWith("success");
    });

    beforeEach(function () {
        module('bahmni.common.orders');
        module(function ($provide) {
            $provide.value('$http', mockHttp);
        });

        inject(['orderService', function (orderServiceInjected) {
            orderService = orderServiceInjected;
        }]);
    });

    it('getOrders should return orders and observations based on orderType if specified', function (done) {
        var params = {
            patientUuid:"somePatientUuid",
            orderTypeUuid:"someOrderTypeUuid",
            includeObs:true,
            numberOfVisits:10
        };

        orderService.getOrders(params).then(function(response) {
            expect(response).toEqual("success");
            done();
        });
        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.bahmniOrderUrl);
        expect(mockHttp.get.calls.mostRecent().args[1].params).toEqual(params);
    });

    it('getOrders should return orders and observations based on orderUuid if specified', function (done) {
        var params = {
            patientUuid:"somePatientUuid",
            includeObs:true,
            numberOfVisits:1,
            obsIgnoreList:10,
            orderUuid:"someOrderUuid"
        };

        orderService.getOrders(params).then(function(response) {
            expect(response).toEqual("success");
            done();
        });
        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.bahmniOrderUrl);
        expect(mockHttp.get.calls.mostRecent().args[1].params).toEqual(params);
    });

    it('getOrders should return orders and observations based on visitUuid if specified', function (done) {
        var params = {
            patientUuid:"somePatientUuid",
            includeObs:true,
            numberOfVisits:1,
            obsIgnoreList:10,
            visitUuid:"someVisitUuid",
            orderUuid:"someOrderUuid"
        };

        orderService.getOrders(params).then(function(response) {
            expect(response).toEqual("success");
            done();
        });
        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.bahmniOrderUrl);
        expect(mockHttp.get.calls.mostRecent().args[1].params).toEqual(params);
    });
});