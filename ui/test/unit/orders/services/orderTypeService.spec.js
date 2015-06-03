'use strict';

describe('Order Type Service', function () {
    var orderTypeService;
    var mockHttp = jasmine.createSpyObj('$http', ['get']);
    mockHttp.get.and.callFake(function(param) {
        return specUtil.respondWith({"data": {results: [{display: 'Drug Order', uuid: 'DrugOrderUuid'}, {display: 'Test Order', uuid: 'TestOrderUuid'}]}});
    });

    beforeEach(function () {
        module('bahmni.common.orders');
        module(function ($provide) {
            $provide.value('$http', mockHttp);
        });

        inject(['orderTypeService', function (orderTypeServiceInjected) {
            orderTypeService = orderTypeServiceInjected;
        }]);
    });

    it('Cache order types after initial load', function (done) {
        orderTypeService.loadAll().then(function() {
            expect(orderTypeService.orderTypes).not.toBeNull();
            expect(orderTypeService.orderTypes.length).toBe(2);
            done();
        });

        expect(mockHttp.get).toHaveBeenCalled();
    });

    it('getOrderTypeUuid should return the uuid of existing OrderType', function (done) {
        orderTypeService.loadAll().then(function() {
            expect(orderTypeService.getOrderTypeUuid("Drug Order")).toEqual("DrugOrderUuid");
            expect(orderTypeService.getOrderTypeUuid("Test Order")).toEqual("TestOrderUuid");
            done();
        });
    });

    it('getOrderTypeUuid should return null for non existing OrderType', function (done) {
        orderTypeService.loadAll().then(function() {
            expect(orderTypeService.getOrderTypeUuid("Random Order")).toBe(undefined);
            done();
        });
    });
});
