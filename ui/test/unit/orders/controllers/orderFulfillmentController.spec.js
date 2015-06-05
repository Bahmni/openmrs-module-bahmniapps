'use strict';

describe("OrderFulfillmentController", function () {

    var scope, rootScope, deferred, deferred1, q;
    var mockEncounterService = jasmine.createSpyObj('encounterService', ['activeEncounter']);
    var mockOrderObservationService = jasmine.createSpyObj('orderObservationService', ['save']);
    var mockOrderTypeService = jasmine.createSpyObj('orderTypeService', ['getOrderTypeUuid']);
    var mockOrderService = jasmine.createSpyObj('orderService', ['getOrders', 'then']);
    var mockAppService = jasmine.createSpyObj('appService', ['getAppDescriptor']);

    mockEncounterService.activeEncounter.and.callFake(function(param) {
        deferred1 = q.defer();
        deferred1.resolve({
            data: {
                observations: [
                    {uuid: "obs1Uuid", orderUuid: "orderOneUuid"},
                    {uuid: "obs2Uuid", orderUuid: "someOrderUuid"}]
            }
        });
        return deferred1.promise;
    });

    mockOrderService.getOrders.and.callFake(function(){
        deferred = q.defer();
        deferred.resolve({
            data:[ {orderUuid: "orderOneUuid"}, {orderUuid: "orderTwoUuid"}]
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
    var mockStateParams = {orderType: "someOrderType"};

    beforeEach(module('bahmni.orders'));

    beforeEach(inject(function ($controller, $rootScope, $q) {
        scope = $rootScope.$new();
        rootScope = $rootScope;
        rootScope.currentProvider = {uuid: "someProviderUuid"};
        q = $q;
        mockAppService.getAppDescriptor = function () {
            return { getConfigValue: function () {
                return {
                    someOrderType: {
                        conceptNames: ["Blood Pressure"]
                    }
                }
            } }
        };
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
            $q :q,
            appService:mockAppService

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
        deferred1.resolve({
            data: {
                observations: [
                    {uuid: "obs1Uuid", orderUuid: "orderOneUuid"},
                    {uuid: "obs2Uuid", orderUuid: "someOrderUuid"}]
            }
        });
        scope.$apply();
        expect(mockOrderService.getOrders).toHaveBeenCalled();
        expect(mockOrderTypeService.getOrderTypeUuid).toHaveBeenCalled();
        expect(mockOrderTypeService.getOrderTypeUuid.calls.mostRecent().args[0]).toEqual("someOrderType");

        expect(mockOrderService.getOrders.calls.mostRecent().args[0]).toEqual("somePatientUuid");
        expect(mockOrderService.getOrders.calls.mostRecent().args[1]).toEqual("someOrderTypeUuid");
        expect(mockOrderService.getOrders.calls.mostRecent().args[2]).toEqual(["Blood Pressure"]);
        expect(mockOrderService.getOrders.calls.mostRecent().args[3]).toEqual(false);
        done();
    });

    it('should toggle showForm value', function(){
        var order = {bahmniObservations: []};
        expect(order.showForm).toBeFalsy();
        scope.toggleShowOrderForm(order);
        expect(order.showForm).toBeTruthy();
    });

    it('should filter active encounter observations for order', function(){
        scope.$digest();
        expect(scope.orders[0].bahmniObservations.length).toBe(1);
        expect(scope.orders[0].bahmniObservations[0].uuid).toEqual("obs1Uuid");
        expect(scope.orders[0].showForm).toBeTruthy();
        expect(scope.orders[1].bahmniObservations.length).toBe(0);
        expect(scope.orders[1].showForm).toBeFalsy();
    });

    it('should auto open the order section with observations ', function(){
        scope.$digest();
        expect(scope.orders[0].showForm).toBeTruthy();
        expect(scope.orders[1].showForm).toBeFalsy();
    });
});