'use strict';

describe('Order Service', function () {
    var orderService;
    var mockHttp = jasmine.createSpyObj('$http', ['get']);
    mockHttp.get.and.callFake(function(param) {
        return specUtil.respondWith("success");
    });

    beforeEach(function () {
        module('bahmni.orders');
        module(function ($provide) {
            $provide.value('$http', mockHttp);
        });

        inject(['orderService', function (orderServiceInjected) {
            orderService = orderServiceInjected;
        }]);
    });

    it('getOrders should return orders for given patientUuid and orderTypeUuid and search handler', function (done) {
        orderService.getOrders("somePatientUuid", "someOrderTypeUuid", "someSearchHandlerName").then(function(response) {
            expect(response).toEqual("success");
            done();
        });

        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.orderUrl);
        expect(mockHttp.get.calls.mostRecent().args[1].params.patientUuid).toEqual("somePatientUuid");
        expect(mockHttp.get.calls.mostRecent().args[1].params.orderTypeUuid).toEqual("someOrderTypeUuid");
        expect(mockHttp.get.calls.mostRecent().args[1].params.s).toEqual("someSearchHandlerName");
    });

    it('getOrders should return orders for given patientUuid and orderTypeUuid and default search handler name', function (done) {
        orderService.getOrders("somePatientUuid", "someOrderTypeUuid", null).then(function(response) {
            expect(response).toEqual("success");
            done();
        });

        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.orderUrl);
        expect(mockHttp.get.calls.mostRecent().args[1].params.patientUuid).toEqual("somePatientUuid");
        expect(mockHttp.get.calls.mostRecent().args[1].params.orderTypeUuid).toEqual("someOrderTypeUuid");
        expect(mockHttp.get.calls.mostRecent().args[1].params.s).toEqual("byOrderType");
    });

    it('getOrders should return paginated orders', function (done) {
        orderService.getOrders("somePatientUuid", "someOrderTypeUuid", null, 1, 10).then(function(response) {
            expect(response).toEqual("success");
            done();
        });

        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.orderUrl);
        expect(mockHttp.get.calls.mostRecent().args[1].params.startIndex).toEqual(1);
        expect(mockHttp.get.calls.mostRecent().args[1].params.limit).toEqual(10);
    });

    it('getOrders should return paginated orders with default offset of 0', function (done) {
        orderService.getOrders("somePatientUuid", "someOrderTypeUuid", null, null, 10).then(function(response) {
            expect(response).toEqual("success");
            done();
        });

        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.orderUrl);
        expect(mockHttp.get.calls.mostRecent().args[1].params.startIndex).toEqual(0);
        expect(mockHttp.get.calls.mostRecent().args[1].params.limit).toEqual(10);
    });
});