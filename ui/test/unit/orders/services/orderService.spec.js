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
        orderService.getOrders("somePatientUuid", "someOrderTypeUuid", null, true, 10, null, null, null).then(function(response) {
            expect(response).toEqual("success");
            done();
        });
        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.bahmniOrderUrl);
        expect(mockHttp.get.calls.mostRecent().args[1].params.orderTypeUuid).toEqual("someOrderTypeUuid");
        expect(mockHttp.get.calls.mostRecent().args[1].params.patientUuid).toEqual("somePatientUuid");
        expect(mockHttp.get.calls.mostRecent().args[1].params.orderUuid).toEqual(undefined);
        expect(mockHttp.get.calls.mostRecent().args[1].params.includeObs).toEqual(true);
    });

    it('getOrders should return orders and observations based on orderUuid if specified', function (done) {
        orderService.getOrders("somePatientUuid", null, null, true, 1, 10, null, "someOrderUuid").then(function(response) {
            expect(response).toEqual("success");
            done();
        });
        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.bahmniOrderUrl);
        expect(mockHttp.get.calls.mostRecent().args[1].params.orderUuid).toEqual("someOrderUuid");
        expect(mockHttp.get.calls.mostRecent().args[1].params.patientUuid).toEqual("somePatientUuid");
        expect(mockHttp.get.calls.mostRecent().args[1].params.orderTypeUuid).toEqual(undefined);
    });

    it('getOrders should return orders and observations based on visitUuid if specified', function (done) {
        orderService.getOrders("somePatientUuid", null, null, true, 1, 10, "someVisitUuid", "someOrderUuid").then(function(response) {
            expect(response).toEqual("success");
            done();
        });
        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.bahmniOrderUrl);
        expect(mockHttp.get.calls.mostRecent().args[1].params.orderUuid).toEqual("someOrderUuid");
        expect(mockHttp.get.calls.mostRecent().args[1].params.patientUuid).toEqual("somePatientUuid");
        expect(mockHttp.get.calls.mostRecent().args[1].params.orderTypeUuid).toEqual(undefined);
        expect(mockHttp.get.calls.mostRecent().args[1].params.visitUuid).toEqual("someVisitUuid");
    });
});