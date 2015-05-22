'use strict';

describe("OrderFulfillmentController", function () {

    var scope, rootScope;
    var mockEncounterService = jasmine.createSpyObj('encounterService', ['activeEncounter']);
    var mockOrderObservationService = jasmine.createSpyObj('orderObservationService', ['save']);
    var mockOrderTypeService = jasmine.createSpyObj('orderTypeService', ['getOrderTypeUuid']);
    var mockOrderService = jasmine.createSpyObj('orderService', ['getOrders']);

    mockEncounterService.activeEncounter.and.callFake(function(param) {
        return specUtil.respondWith({data: "success"});
    });

    mockOrderService.getOrders.and.callFake(function(param) {
        return specUtil.respondWith({data: "success"});
    });

    mockOrderTypeService.getOrderTypeUuid.and.callFake(function(params) {
        return "someOrderTypeUuid";
    });

    var mockSessionService = {
        getLoginLocationUuid: function(){
            return "someLocationUuid";
        }
    };
    var mockStateParams = {orderType: "someOrderType"}

    beforeEach(module('bahmni.orders'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        rootScope = $rootScope;
        rootScope.currentProvider = {uuid: "someProviderUuid"};

        $controller('OrderFulfillmentController', {
            $scope: scope,
            $rootScope: rootScope,
            encounterService: mockEncounterService,
            patientContext: {patient: {uuid: "somePatientUuid"}},
            orderObservationService: mockOrderObservationService,
            sessionService: mockSessionService,
            orderTypeService: mockOrderTypeService,
            $stateParams: mockStateParams,
            orderService: mockOrderService

        });
    }));

    it('should get active encounter', function (done) {
        expect(mockEncounterService.activeEncounter).toHaveBeenCalled();
        expect(mockEncounterService.activeEncounter.calls.mostRecent().args[0].patientUuid).toEqual("somePatientUuid");
        expect(mockEncounterService.activeEncounter.calls.mostRecent().args[0].locationUuid).toEqual("someLocationUuid");
        expect(mockEncounterService.activeEncounter.calls.mostRecent().args[0].providerUuid).toEqual("someProviderUuid");
        done();
    });

    it('should get orders for given order type ', function (done) {
        expect(mockOrderTypeService.getOrderTypeUuid).toHaveBeenCalled();
        expect(mockOrderTypeService.getOrderTypeUuid.calls.mostRecent().args[0]).toEqual("someOrderType");
        expect(mockOrderService.getOrders).toHaveBeenCalled();
        expect(mockOrderService.getOrders.calls.mostRecent().args[0]).toEqual("somePatientUuid");
        expect(mockOrderService.getOrders.calls.mostRecent().args[1]).toEqual("someOrderTypeUuid");
        done();
    });

    it('should toggle showForm value', function(){
        var order = {observations: []};
        expect(order.showForm).toBeFalsy();
        scope.showOrderForm(order);
        expect(order.showForm).toBeTruthy();
    });

    it('should filter avtive encounter observations for order', function(){
        var orderWithoutObservation = {'uuid': "someOrderUuid"};
        scope.encounter = {observations: [{uuid: "obs1Uuid", orderUuid: "orderOneUuid"}, {uuid: "obs2Uuid", orderUuid: "someOrderUuid"}]}
        scope.showOrderForm(orderWithoutObservation);
        expect(orderWithoutObservation.observations.length).toBe(1);
        expect(orderWithoutObservation.observations[0].uuid).toEqual("obs2Uuid");
    });
});