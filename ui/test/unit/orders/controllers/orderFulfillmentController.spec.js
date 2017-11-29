'use strict';

describe("OrderFulfillmentController", function () {

    var scope, rootScope, deferred, deferred1, q, $bahmniCookieStore, contextChangeHandler;
    var mockEncounterService = jasmine.createSpyObj('encounterService', ['find']);
    var mockOrderObservationService = jasmine.createSpyObj('orderObservationService', ['save']);
    var mockOrderTypeService = jasmine.createSpyObj('orderTypeService', ['getOrderTypeUuid']);
    var mockOrderService = jasmine.createSpyObj('orderService', ['getOrders', 'then']);
    var contextChangeHandlerService = jasmine.createSpyObj('contextChangeHandler',['execute']);

    mockEncounterService.find.and.callFake(function(param) {
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

    beforeEach(module(function ($provide) {
        $provide.value('appService', {});
        $bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['get', 'remove', 'put']);
        $provide.value('$bahmniCookieStore', $bahmniCookieStore);
    }));

    beforeEach(inject(function ($controller, $rootScope, $q) {
        scope = $rootScope.$new();
        rootScope = $rootScope;
        rootScope.currentProvider = {uuid: "someProviderUuid"};
        q = $q;
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
            orderFulfillmentConfig: { conceptNames: ["Blood Pressure"]},
            contextChangeHandler: contextChangeHandlerService
        });
    }));

        it('should get active encounter', function (done) {
        expect(mockEncounterService.find).toHaveBeenCalled();
        expect(mockEncounterService.find.calls.mostRecent().args[0].patientUuid).toEqual("somePatientUuid");
        expect(mockEncounterService.find.calls.mostRecent().args[0].locationUuid).toEqual("someLocationUuid");
        expect(mockEncounterService.find.calls.mostRecent().args[0].providerUuids[0]).toEqual("someProviderUuid");
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
        expect(mockOrderService.getOrders.calls.mostRecent().args[0].patientUuid).toEqual("somePatientUuid");
        expect(mockOrderService.getOrders.calls.mostRecent().args[0].orderTypeUuid).toEqual("someOrderTypeUuid");
        expect(mockOrderService.getOrders.calls.mostRecent().args[0].conceptNames).toEqual(["Blood Pressure"]);
        expect(mockOrderService.getOrders.calls.mostRecent().args[0].includeObs).toEqual(false);
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

    it('should return true if form is valid ', function () {
        spyOn(scope,'isFormValid').and.callThrough();
        contextChangeHandlerService.execute.and.callFake(function() {
            return {allow: true};
        });
        scope.$digest();
        expect(scope.isFormValid()).toBe(true);
    });

    it('should return true if form is valid ', function () {
        spyOn(scope,'isFormValid').and.callThrough();
        contextChangeHandlerService.execute.and.callFake(function() {
            return {allow: false};
        });
        scope.$digest();
        expect(scope.isFormValid()).toBe(false);
    });


    it('should show error message if form is not valid ', function () {
        scope.isFormValid = function() {return false};
        spyOn(scope.$parent, '$broadcast').and.callThrough();

        scope.$broadcast("event:saveOrderObservations");
        scope.$digest();

        expect(scope.$parent.$broadcast).toHaveBeenCalledWith("event:errorsOnForm");
    });
});