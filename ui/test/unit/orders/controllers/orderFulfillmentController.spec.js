'use strict';

describe("OrderFulfillmentController", function () {

    var scope, rootScope, deferred, deferred1, deferred2, q, $bahmniCookieStore, contextChangeHandler, translate;
    var mockEncounterService = jasmine.createSpyObj('encounterService', ['find']);
    var mockOrderObservationService = jasmine.createSpyObj('orderObservationService', ['save']);
    var mockOrderTypeService = jasmine.createSpyObj('orderTypeService', ['getOrderTypeUuid']);
    var mockOrderService = jasmine.createSpyObj('orderService', ['getOrders', 'then']);
    var contextChangeHandlerService = jasmine.createSpyObj('contextChangeHandler',['execute']);
    var mockObservationsService = jasmine.createSpyObj('observationsService', ['fetch']);
    var appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
    var mockState = jasmine.createSpyObj('state', ['transitionTo']);
    var mockMessagingService = jasmine.createSpyObj('messagingService', ['showMessage']);

    appService.getAppDescriptor.and.returnValue({
        getConfigValue: function (key) {
            var configs = {orderLabelConcept: 'orderLabelConcept'};
            return configs[key];
        }
    });

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

    mockState.transitionTo.and.callFake(function(param) {
        deferred1 = q.defer();
        deferred1.resolve({
            reload: true,
            inherit: false,
            notify: true
        });
        return deferred1.promise;
    })

    mockOrderObservationService.save.and.callFake(function(param) {
        deferred = q.defer();
        deferred1.resolve({
            data: {
                observations: [
                    {uuid: "obs1Uuid", orderUuid: "orderOneUuid"},
                    {uuid: "obs2Uuid", orderUuid: "someOrderUuid"}]
            }
        });
        return deferred.promise;
    })

    mockObservationsService.fetch.and.callFake(function(param) {
        deferred2 = q.defer();
        deferred2.resolve({
            data: [
                {
                    "orderUuid": "orderOneUuid",
                    "orderNumber": "ORD-334",
                    "orderTypeUuid": "8189dbdd-3f10-11e4-adec-0800271c1b75",
                    "concept": {
                        "uuid": "5b5d5317-0b0d-46f2-9dd6-036f47a885ae",
                        "name": "nonOrderLabelConcept",
                        "dataType": "Coded",
                    },
                    "value": {
                        "uuid": "23eab206-af8d-4ec3-ae14-949739eed400",
                        "name": "Radiologist C",
                        "dataType": "Coded",
                    }
                },
                {
                    "orderUuid": "orderTwoUuid",
                    "orderNumber": "ORD-334",
                    "orderTypeUuid": "8189dbdd-3f10-11e4-adec-0800271c1b75",
                    "concept": {
                        "uuid": "5b5d5317-0b0d-46f2-9dd6-036f47a885ae",
                        "name": "nonOrderLabelConcept",
                        "dataType": "Text",
                    },
                    "value": "Radiologist B"
                }
            ]
        });
        return deferred2.promise;
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
        translate = jasmine.createSpyObj("$translate", ["instant"]);
        $provide.value('$translate', translate);
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
            $state: mockState,
            encounterService: mockEncounterService,
            patientContext: {patient: {uuid: "somePatientUuid"}},
            orderObservationService: mockOrderObservationService,
            messagingService: mockMessagingService,
            sessionService: mockSessionService,
            orderTypeService: mockOrderTypeService,
            $stateParams: mockStateParams,
            orderService: mockOrderService,
            observationsService: mockObservationsService,
            appService: appService,
            $q :q,
            orderFulfillmentConfig: { conceptNames: ["Blood Pressure"]},
            contextChangeHandler: contextChangeHandlerService,
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

    it('should give message for empty order', function () {
        var orderType = "Test order";
        scope.orderType = orderType;
        scope.$digest();
        scope.getEmptyMessage();
        expect(translate.instant).toHaveBeenCalledWith("NO_ORDERS_PRESENT", {orderType: orderType});
    });

    it('should get Observationa for patient with orderLabelConcept', function () {
        scope.$digest();
        expect(mockObservationsService.fetch).toHaveBeenCalled();
        expect(mockObservationsService.fetch.calls.mostRecent().args[0]).toEqual("somePatientUuid");
        expect(mockObservationsService.fetch.calls.mostRecent().args[1]).toEqual(['orderLabelConcept']);
        expect(scope.selectedOrderLabel['orderOneUuid']).toBe('Radiologist C');
        expect(scope.selectedOrderLabel['orderTwoUuid']).toBe('Radiologist B');
    });

    it("should correctly process coded concept data", function () {
        scope.$digest();
        expect(mockObservationsService.fetch).toHaveBeenCalled();
        expect(mockObservationsService.fetch.calls.mostRecent().args[0]).toEqual("somePatientUuid");
        expect(mockObservationsService.fetch.calls.mostRecent().args[1]).toEqual(['orderLabelConcept']);
        expect(scope.selectedOrderLabel['orderOneUuid']).toBe('Radiologist C');
    });

    it("should correctly process text concept data", function () {
        scope.$digest();
        expect(mockObservationsService.fetch).toHaveBeenCalled();
        expect(mockObservationsService.fetch.calls.mostRecent().args[0]).toEqual("somePatientUuid");
        expect(mockObservationsService.fetch.calls.mostRecent().args[1]).toEqual(['orderLabelConcept']);
        expect(scope.selectedOrderLabel['orderTwoUuid']).toBe('Radiologist B');
    });

    it('should handle saveOrderObservations event correctly', function () {
        spyOn(scope, 'isFormValid').and.returnValue(true);
        spyOn(scope.$parent, '$broadcast').and.callThrough();
        deferred = q.defer();
        deferred.resolve();
        mockOrderObservationService.save.and.returnValue(deferred.promise);
        scope.$broadcast('event:saveOrderObservations');
        scope.$digest();
        deferred.promise.then(() => {
            expect(mockOrderObservationService.save).toHaveBeenCalledWith(scope.orders, scope.patient, mockSessionService.getLoginLocationUuid());
            expect(mockState.transitionTo).toHaveBeenCalledWith(mockState.current, mockState.params, {
                reload: true,
                inherit: false,
                notify: true
            });
            expect(mockMessagingService.showMessage).toHaveBeenCalledWith('info', 'Saved');
        });
    });
    
    it('should handle saveOrderObservations event with invalid form', function () {
        scope.isFormValid = function() {return false};
        spyOn(scope.$parent, '$broadcast').and.callThrough();
        scope.$broadcast("event:saveOrderObservations");
        expect(scope.$parent.$broadcast).toHaveBeenCalledWith('event:errorsOnForm');
    });
    
    it('should handle error when saveOrderObservations event is triggered', function () {
        spyOn(scope, 'isFormValid').and.returnValue(true);
        deferred = q.defer();
        deferred.reject({
            data: {
                error: {
                    message: "Visit Type is required"
                }
            }
        });
        mockOrderObservationService.save.and.returnValue(deferred.promise);
        scope.$broadcast('event:saveOrderObservations');
        scope.$digest();
        deferred.promise.catch(function () {
            expect(mockMessagingService.showMessage).toHaveBeenCalledWith('error', 'VISIT_CLOSED_CREATE_NEW_ERROR_MESSAGE');
            expect(translate.instant).toHaveBeenCalledWith('VISIT_CLOSED_CREATE_NEW_ERROR_MESSAGE');
        });
    });
});