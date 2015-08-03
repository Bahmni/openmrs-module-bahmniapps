'use strict';

describe("OrdersDisplayControl", function () {
    var compile, scope, orderService, orderTypeService, spinner, orders;

    beforeEach(function () {
        module('bahmni.common.uiHelper');
        module('bahmni.common.displaycontrol.orders');
        module('ngHtml2JsPreprocessor');

        module(function ($provide) {
            orderService = jasmine.createSpyObj('orderService', ['getOrders']);
            orderTypeService = jasmine.createSpyObj('orderTypeService', ['getOrderTypeUuid']);
            spinner = jasmine.createSpyObj('spinner', ['forPromise']);
            $provide.value('orderService', orderService);
            $provide.value('orderTypeService', orderTypeService);
            $provide.value('spinner', spinner);
        });
        inject(function ($compile, $rootScope) {
            compile = $compile;
            scope = $rootScope.$new();
        });
    });

    var generateElement = function () {
        var unCompiledHtml =
            '<orders-control ' +
            'patient="patient" ' +
            'config="config" ' +
            'section="section" ' +
            'order-type="orderType" ' +
            'order-uuid="orderUuid" ' +
            'is-on-dashboard="isOnDashboard">' +
            '</orders-control>';

        var element = compile(angular.element(unCompiledHtml))(scope);
        scope.$digest();
        return element;
    };
    beforeEach(function () {
        scope.section = {};
        scope.config = {};
        scope.patient = {uuid: "patientUuid"};
        orders = [{
            "conceptName": "Absconding",
            "orderDate": "2014-12-16T16:06:49.000+0530",
            "provider": "Surajkumar Surajkumar Surajkumar",
            "bahmniObservations": []
        }];
    });
    it('should call using order uuid if present', function () {
        scope.config.numberOfVisits = 1;
        scope.orderUuid = "someOrderUuid";

        orderService.getOrders.and.returnValue(specUtil.createFakePromise(orders));
        var element = generateElement();

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
        expect(compiledElementScope.bahmniOrders.length).toBe(1);
        expect(compiledElementScope.bahmniOrders[0]).toEqual(jasmine.objectContaining(expectedOrders[0]));
    });

    it('should return title when show-title flag is true', function () {
        scope.config.numberOfVisits = 1;
        scope.orderUuid = "someOrderUuid";

        orderService.getOrders.and.returnValue(specUtil.createFakePromise(orders));
        var element = generateElement();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        var expectedDate = moment(orders[0].orderDate).format("DD MMM YY h:mm a");
        expect(compiledElementScope.getTitle(orders[0])).toBe("Absconding on " + expectedDate + " by Surajkumar Surajkumar Surajkumar")
    });

    it('should set hideIfEmpty flag if the orders observations are empty', function () {
        scope.config.numberOfVisits = 1;
        scope.orderUuid = "someOrderUuid";

        orderService.getOrders.and.returnValue(specUtil.createFakePromise(orders));
        var element = generateElement();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        expect(compiledElementScope.bahmniOrders[0].hideIfEmpty).toBe(true)
    });

    it('should set showHeader flag if it is not present', function () {
        scope.config.numberOfVisits = 1;
        scope.orderUuid = "someOrderUuid";

        orderService.getOrders.and.returnValue(specUtil.createFakePromise(orders));
        var element = generateElement();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        expect(compiledElementScope.config.showHeader).toBe(true);
    });

    it('should not set showHeader flag if it is present', function () {
        scope.config.numberOfVisits = 1;
        scope.orderUuid = "someOrderUuid";
        scope.config.showHeader = false;

        orderService.getOrders.and.returnValue(specUtil.createFakePromise(orders));
        var element = generateElement();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        expect(compiledElementScope.config.showHeader).toBe(false);
    });

    it('should have children 1 section', function () {

        orderService.getOrders.and.returnValue(specUtil.createFakePromise(orders));
        var element = generateElement();

        expect(element.children()[0].localName).toBe('section');
    });

    it('1 section child should have children 1 section and 1 div', function () {

        orderService.getOrders.and.returnValue(specUtil.createFakePromise(orders));
        var element = generateElement();

        expect(element.children()[0].localName).toBe('section');

        var section = $(element.children()[0]);

        expect(section.children()[0].localName).toBe('section');
        expect(section.children()[1].localName).toBe('div');
    });

    it('1 section child should have children 1 h2, 1 section and 1 div', function () {
        scope.section.title = "testTitle";

        orderService.getOrders.and.returnValue(specUtil.createFakePromise(orders));
        var element = generateElement();

        expect(element.children()[0].localName).toBe('section');
        var section = $(element.children()[0]);

        expect(section.children()[0].localName).toBe('h2');
        expect(section.children()[0].innerText).toContain('testTitle');
        expect(section.children()[1].localName).toBe('section');
        expect(section.children()[2].localName).toBe('div');
    });

    it('should open the first and close the rest', function () {
        scope.config.showHeader = true;
        scope.config.numberOfVisits = 1
        scope.config.title = "testTitle";
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

        orderService.getOrders.and.returnValue(specUtil.createFakePromise(orders));
        var element = generateElement();

        var section = $(element.find('section')[0]).find('section')[0];

        var bahmniObservations = $($(section).find('ul')[0]).children();

        var firstOrderITags = $(bahmniObservations[0]).find('i');
        var firstOrderFulfillments = $(bahmniObservations[0]).find('ul')[0];

        var secondOrderITags = $(bahmniObservations[1]).find('i');
        var secondOrderFulfillments = $(bahmniObservations[1]).find('ul')[0];

        expect(element.children()[0].localName).toBe('section');

        //firstOrder isOPen
        expect(firstOrderITags[0].className).toContain('fa-caret-right');
        expect(firstOrderITags[0].className).toContain('ng-hide');
        expect(firstOrderITags[1].className).toContain('fa-caret-down');
        expect(firstOrderITags[1].className).not.toContain('ng-hide');
        expect(firstOrderFulfillments.className).not.toContain('ng-hide');

        //secondOrder isOPen
        expect(secondOrderITags[0].className).toContain('fa-caret-right');
        expect(secondOrderITags[0].className).not.toContain('ng-hide');
        expect(secondOrderITags[1].className).toContain('fa-caret-down');
        expect(secondOrderITags[1].className).toContain('ng-hide');
        expect(secondOrderFulfillments.className).toContain('ng-hide');
    });

    describe("noOrdersMessage", function () {

        beforeEach(function () {
            scope.config = {};
            scope.patient = {};
            scope.section = {
                title: "testTitle"
            };
            scope.orderType = "testOrder";
        });

        it('should show the noOrdersMessage when there is no order', function () {

            orderService.getOrders.and.returnValue(specUtil.createFakePromise([]));
            var element = generateElement();

            expect(element.children()[0].localName).toBe('section');

            var section = $(element.children()[0]);

            expect(section.children()[2].localName).toBe('div');
            expect($(section.children()[2]).text()).toContain("No testOrder for this patient.");
        });

        it('should not show the noOrdersMessage when there are orders', function () {

            orderService.getOrders.and.returnValue(specUtil.createFakePromise(orders));
            var element = generateElement();

            expect(element.children()[0].localName).toBe('section');

            var section = $(element.children()[0]);

            expect($(section.children()[2]).text()).not.toContain("No testOrder for this patient.");
        });
    });
});