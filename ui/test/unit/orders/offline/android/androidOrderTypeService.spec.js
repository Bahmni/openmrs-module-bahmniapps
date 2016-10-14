'use strict';

describe('Order Type Service', function () {
    var orderTypeService, $q = Q;
    var mockandroidDbService;

    beforeEach(module('bahmni.common.orders'));
    beforeEach(module('bahmni.common.offline'));

    beforeEach(module(function ($provide) {
        var orderType = {
            "data": [
                {display: 'Drug Order', uuid: 'DrugOrderUuid'},
                {display: 'Test Order', uuid: 'TestOrderUuid'}
            ]
        };
        mockandroidDbService = jasmine.createSpyObj('androidDbService', ['getReferenceData']);
        mockandroidDbService.getReferenceData.and.returnValue(specUtil.respondWithPromise($q, orderType));
        $provide.value('$q', $q);
        $provide.value('androidDbService', mockandroidDbService);

    }));

    beforeEach(inject(function (_orderTypeService_) {
        orderTypeService = _orderTypeService_;
    }));

    it('Cache order types after initial load', function (done) {
        orderTypeService.loadAll().then(function(result) {
            expect(orderTypeService.orderTypes).not.toBeNull();
            expect(orderTypeService.orderTypes.length).toBe(2);
            done();
        });
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
