'use strict';

describe('Orders DisplayControl', function () {
    var q,
        compile,
        mockBackend,
        rootScope,
        deferred,
        simpleHtml = '<orders-control config="section" patient="patient" order-uuid="orderUuid"></orders-control>';
    var _orderService;
    var orders = [
        {
            "conceptName": "Absconding",
            "orderDate": "2014-12-16T16:06:49.000+0530",
            "provider": "Surajkumar Surajkumar Surajkumar",
            "bahmniObservations": []
        }
    ];

    beforeEach(function () {
        module('bahmni.common.domain');
        module('bahmni.common.orders');
        module('bahmni.common.uiHelper');
        module('bahmni.common.displaycontrol.orders');

        module(function ($provide) {
            var _spinner = jasmine.createSpyObj('spinner', ['forPromise', 'then']);
            _orderService = jasmine.createSpyObj('orderService', ['getOrders', 'then']);
            _spinner.forPromise.and.callFake(function () {
                deferred = q.defer();
                deferred.resolve({data: orders});
                return deferred.promise;
            });

            _spinner.then.and.callThrough({data: orders});

            $provide.value('spinner', _spinner);
        });

        inject(function ($compile, $httpBackend, $rootScope, $q) {
            compile = $compile;
            mockBackend = $httpBackend;
            rootScope = $rootScope;
            q = $q;
        });
    });

    it('should call using order uuid if present', function () {
        var scope = rootScope.$new();

        scope.section = {
            numberOfVisits: 1
        };
        scope.patient = {uuid: "patientUuid"};
        scope.orderUuid = "someOrderUuid";

        mockBackend.expectGET('../common/displaycontrols/orders/views/ordersControl.html').respond("<div>dummy</div>");
        mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/orders?includeObs=true&numberOfVisits=1&orderUuid=someOrderUuid&patientUuid=patientUuid').respond(orders);

        var element = compile(simpleHtml)(scope);

        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        var expectedOrders = [
            {
                "conceptName": "Absconding",
                "orderDate": "2014-12-16T16:06:49.000+0530",
                "provider": "Surajkumar Surajkumar Surajkumar",
                "bahmniObservations": [],
                "hideIfEmpty": true,
                "isOpen": true
            }
        ];

        expect(compiledElementScope.bahmniOrders).not.toBeUndefined();
        expect(compiledElementScope.bahmniOrders).toEqual(expectedOrders);
    });

    it('should return title when show-title flag is true', function () {
        var scope = rootScope.$new();
        scope.section = {
            numberOfVisits: 1
        };
        scope.patient = {uuid: "patientUuid"};
        scope.orderUuid = "someOrderUuid";

        mockBackend.expectGET('../common/displaycontrols/orders/views/ordersControl.html').respond("<div>dummy</div>");
        mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/orders?includeObs=true&numberOfVisits=1&orderUuid=someOrderUuid&patientUuid=patientUuid').respond(orders);

        var element = compile(simpleHtml)(scope);

        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        var expectedDate = moment(orders[0].orderDate).format("DD MMM YY h:mm a");
        expect(compiledElementScope.getTitle(orders[0])).toBe("Absconding on " + expectedDate + " by Surajkumar Surajkumar Surajkumar")
    });

    it('should set hideIfEmpty flag if the orders observations are empty', function () {
        var scope = rootScope.$new();
        scope.section = {
            numberOfVisits: 1
        };
        scope.patient = {uuid: "patientUuid"};
        scope.orderUuid = "someOrderUuid";

        mockBackend.expectGET('../common/displaycontrols/orders/views/ordersControl.html').respond("<div>dummy</div>");
        mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/orders?includeObs=true&numberOfVisits=1&orderUuid=someOrderUuid&patientUuid=patientUuid').respond(orders);

        var element = compile(simpleHtml)(scope);

        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        expect(compiledElementScope.bahmniOrders[0].hideIfEmpty).toBe(true)
    });

    it('should set showHeader flag if the its not already set', function () {
        var scope = rootScope.$new();
        scope.section = {
            numberOfVisits: 1
        };
        scope.patient = {uuid: "patientUuid"};
        scope.orderUuid = "someOrderUuid";

        mockBackend.expectGET('../common/displaycontrols/orders/views/ordersControl.html').respond("<div>dummy</div>");
        mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/orders?includeObs=true&numberOfVisits=1&orderUuid=someOrderUuid&patientUuid=patientUuid').respond([]);

        var element = compile(simpleHtml)(scope);

        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        expect(compiledElementScope.config.showHeader).toBe(true);
    });

    it('should not set showHeader flag if the its already set', function () {
        var scope = rootScope.$new();
        scope.section = {
            numberOfVisits: 1,
            showHeader: false
        };
        scope.config = {
            showHeader: false
        };
        scope.patient = {uuid: "patientUuid"};
        scope.orderUuid = "someOrderUuid";

        mockBackend.expectGET('../common/displaycontrols/orders/views/ordersControl.html').respond("<div>dummy</div>");
        mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/orders?includeObs=true&numberOfVisits=1&orderUuid=someOrderUuid&patientUuid=patientUuid').respond([]);

        var element = compile(simpleHtml)(scope);

        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        expect(compiledElementScope.config.showHeader).toBe(false);
    });

    it('should set isOpen flag for the first order', function () {
        var scope = rootScope.$new();

        scope.section = {
            numberOfVisits: 1
        };
        scope.patient = {uuid: "patientUuid"};
        scope.orderUuid = "someOrderUuid";
        var orders = [
            {
                "conceptName": "Absconding",
                "orderDate": "2014-12-16T16:06:49.000+0530",
                "provider": "Surajkumar Surajkumar Surajkumar",
                "bahmniObservations": []
            },
            {
                "conceptName": "Pulse",
                "orderDate": "2014-12-16T16:06:49.000+0530",
                "provider": "Surajkumar Surajkumar Surajkumar",
                "bahmniObservations": []
            }
        ];

        mockBackend.expectGET('../common/displaycontrols/orders/views/ordersControl.html').respond("<div>dummy</div>");
        mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/orders?includeObs=true&numberOfVisits=1&orderUuid=someOrderUuid&patientUuid=patientUuid').respond(orders);

        var element = compile(simpleHtml)(scope);

        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        var expectedOrders = [
            {
                "conceptName": "Absconding",
                "orderDate": "2014-12-16T16:06:49.000+0530",
                "provider": "Surajkumar Surajkumar Surajkumar",
                "bahmniObservations": [],
                "hideIfEmpty": true,
                "isOpen": true
            },
            {
                "conceptName": "Pulse",
                "orderDate": "2014-12-16T16:06:49.000+0530",
                "provider": "Surajkumar Surajkumar Surajkumar",
                "bahmniObservations": [],
                "hideIfEmpty": true
            }
        ];

        expect(compiledElementScope.bahmniOrders).not.toBeUndefined();
        expect(compiledElementScope.bahmniOrders).toEqual(expectedOrders);
        expect(compiledElementScope.bahmniOrders[1].isOpen).toEqual(undefined);
    });
});