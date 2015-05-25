'use strict';

describe("OrderFulfillmentController", function () {

    var scope, rootScope, deferred, q;
    var mockEncounterService = jasmine.createSpyObj('encounterService', ['activeEncounter']);
    var mockOrderObservationService = jasmine.createSpyObj('orderObservationService', ['save']);
    var mockOrderTypeService = jasmine.createSpyObj('orderTypeService', ['getOrderTypeUuid']);
    var mockOrderService = jasmine.createSpyObj('orderService', ['getOrders', 'then']);

    mockEncounterService.activeEncounter.and.callFake(function(param) {
        deferred = q.defer();
        deferred.resolve({
            data: {
                observations: [
                    {uuid: "obs1Uuid", orderUuid: "orderOneUuid"},
                    {uuid: "obs2Uuid", orderUuid: "someOrderUuid"}]
            }
        });
        return deferred.promise;
    });

    mockOrderService.getOrders.and.callFake(function(){
        deferred = q.defer();
        deferred.resolve({
            data: {
                results: [{uuid: "orderOneUuid"}, {uuid: "orderTwoUuid"}]
            }
        });
        return deferred.promise;
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

    beforeEach(inject(function ($controller, $rootScope, $q) {
        scope = $rootScope.$new();
        rootScope = $rootScope;
        rootScope.currentProvider = {uuid: "someProviderUuid"};
        q =$q;
        $controller('OrderFulfillmentController', {
            $scope: scope,
            $rootScope: rootScope,
            encounterService: mockEncounterService,
            patientContext: {patient: {uuid: "somePatientUuid"}},
            orderObservationService: mockOrderObservationService,
            sessionService: mockSessionService,
            orderTypeService: mockOrderTypeService,
            $stateParams: mockStateParams,
            orderService: mockOrderService,
            $q :q

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

    it('should filter active encounter observations for order', function(){
        scope.$digest();
        expect(scope.orders[0].observations.length).toBe(1);
        expect(scope.orders[0].observations[0].uuid).toEqual("obs1Uuid");
        expect(scope.orders[1].observations.length).toBe(0);

    });

    it('should auto open the order section with observations ', function(){
        scope.$digest();
        expect(scope.orders[0].showForm).toBeTruthy();
        expect(scope.orders[1].showForm).toBeFalsy();
    });
});