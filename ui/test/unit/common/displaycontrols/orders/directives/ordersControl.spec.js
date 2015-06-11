'use strict';

describe('Orders DisplayControl', function () {
    var q,
        compile,
        mockBackend,
        rootScope,
        deferred, controller,
        simpleHtml = '<orders-control  config="section" patient="patient" order-uuid="orderUuid"></orders-control>';
    var _orderService;
    var orders = [
        {
            "conceptName": "Absconding",
            "orderDate": "2014-12-16T16:06:49.000+0530",
            "provider": "Surajkumar Surajkumar Surajkumar",
            "bahmniObservations": []
        }
    ];

    beforeEach(module('bahmni.common.uiHelper'), function(){});
    beforeEach(module('bahmni.common.domain'), function(){});
    beforeEach(module('bahmni.common.orders'), function(){});

    beforeEach(module('bahmni.common.displaycontrol.orders'), function($provide){
        var _spinner = jasmine.createSpyObj('spinner',['forPromise','then']);
        _orderService = jasmine.createSpyObj('orderService',['getOrders','then']);
        _spinner.forPromise.and.callFake(function(){
            deferred = q.defer();
            deferred.resolve({data: orders});
            return deferred.promise;
        });

        _spinner.then.and.callThrough({data: orders});

        $provide.value('spinner', _spinner);
    });

    beforeEach(inject(function ($compile, $httpBackend, $rootScope,$q) {
        compile = $compile;
        mockBackend = $httpBackend;
        rootScope = $rootScope;
        q = $q;
    }));

    it('should call using order uuid if present', function () {
        var scope = rootScope.$new();

        scope.section = {
            numberOfVisits:1
        };
        scope.patient = {uuid : "patientUuid"};
        scope.orderUuid= "someOrderUuid";

        mockBackend.expectGET('../common/displaycontrols/orders/views/ordersControl.html').respond("<div>dummy</div>");
        mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/orders?includeObs=true&numberOfVisits=1&orderUuid=someOrderUuid&patientUuid=patientUuid').respond(orders);

        var element = compile(simpleHtml)(scope);

        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        expect(compiledElementScope.bahmniOrders).not.toBeUndefined();
        expect(compiledElementScope.bahmniOrders).toEqual(orders);
    });

    it('should return title when show-title flag is true', function(){
        var scope = rootScope.$new();
        scope.section = {
            numberOfVisits:1
        };
        scope.patient = {uuid : "patientUuid"};
        scope.orderUuid= "someOrderUuid";

        mockBackend.expectGET('../common/displaycontrols/orders/views/ordersControl.html').respond("<div>dummy</div>");
        mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/orders?includeObs=true&numberOfVisits=1&orderUuid=someOrderUuid&patientUuid=patientUuid').respond(orders);

        var element = compile(simpleHtml)(scope);

        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        expect(compiledElementScope.getTitle(orders[0])).toBe("Absconding on 16 Dec 14 4:06 pm by Surajkumar Surajkumar Surajkumar")
    });
});