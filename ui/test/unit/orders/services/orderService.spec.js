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

    it('getOrders should return orders for given patientUuid and orderTypeUuid', function (done) {
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

    it('getPendingOrders should return pending orders for given patientUuid and orderTypeUuid', function (done) {
        orderService.getPendingOrders("somePatientUuid", "someOrderTypeUuid").then(function(response) {
            expect(response).toEqual("success");
            done();
        });

        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.orderUrl);
        expect(mockHttp.get.calls.mostRecent().args[1].params.patientUuid).toEqual("somePatientUuid");
        expect(mockHttp.get.calls.mostRecent().args[1].params.orderTypeUuid).toEqual("someOrderTypeUuid");
        expect(mockHttp.get.calls.mostRecent().args[1].params.s).toEqual("pendingOrders");
    });
});