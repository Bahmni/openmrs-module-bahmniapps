'use strict';

describe("OrdersDisplayControl", function () {
    var compile, scope, orderService, orderTypeService, spinner, orders, translateFilter;
    beforeEach(function () {
        module('bahmni.common.uiHelper');
        module('bahmni.common.displaycontrol.orders');
        module('ngHtml2JsPreprocessor');
        module('bahmni.common.i18n');

        module(function ($provide) {
            orderService = jasmine.createSpyObj('orderService', ['getOrders']);
            orderTypeService = jasmine.createSpyObj('orderTypeService', ['getOrderTypeUuid']);
            spinner = jasmine.createSpyObj('spinner', ['forPromise']);
            translateFilter = jasmine.createSpy('translateFilter');
            $provide.value('translateFilter',translateFilter);
            $provide.value('orderService', orderService);
            $provide.value('orderTypeService', orderTypeService);
            $provide.value('spinner', spinner);
        });


        inject(function ($compile, $rootScope) {
            compile = $compile;
            scope = $rootScope.$new();
            scope.concept = undefined;
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

        var expectedDate = moment(orders[0].orderDate).format("DD MMM YYYY h:mm a");
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

        expect(element.children()[0]).toEqual('section');
    });


    it('1 section child should have children 1 h2 and 1 div', function () {
        scope.section.title = "testTitle";

        orderService.getOrders.and.returnValue(specUtil.createFakePromise(orders));
        var element = generateElement();

        expect(element.children()[0]).toEqual('section');
        var section = $(element.children()[0]);

        expect(section.children()[0]).toEqual('h2');
        expect(section.children()[1]).toEqual('div');
    });

    it('should open the first and close the rest', function () {
        scope.config.showHeader = true;
        scope.config.numberOfVisits = 1;
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

        expect(element.children()[0]).toEqual('section');

        var section = $(element.find('section')[0]).find('section')[0];

        var bahmniObservations = $($(section).find('ul')[0]).children();

        var firstOrderITags = $(bahmniObservations[0]).find('i');
        var firstOrderFulfillments = $(bahmniObservations[0]).find('ul')[0];

        var secondOrderITags = $(bahmniObservations[1]).find('i');
        var secondOrderFulfillments = $(bahmniObservations[1]).find('ul')[0];

        //firstOrder isOPen
        expect(firstOrderITags[0]).toHaveClass('fa-caret-right');
        expect(firstOrderITags[1]).toHaveClass('fa-caret-down');
        expect(firstOrderITags[1]).not.toHaveClass('ng-hide');
        expect(firstOrderFulfillments).not.toHaveClass('ng-hide');

        //secondOrder isOPen
        expect(secondOrderITags[0]).toHaveClass('fa-caret-right');
        expect(secondOrderITags[0]).not.toHaveClass('ng-hide');
        expect(secondOrderITags[1]).toHaveClass('fa-caret-down');
        expect(secondOrderFulfillments).toHaveClass('ng-hide');
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

          var topLevelSection = element.children()[0];
            expect(topLevelSection).toEqual('section');

            var noMessageSecion = $(topLevelSection).find('>div>div');
            expect(noMessageSecion).toBeDefined();
        });

        it('should not show the noOrdersMessage when there are orders', function () {

            orderService.getOrders.and.returnValue(specUtil.createFakePromise(orders));
            var element = generateElement();

            expect(element.children()[0]).toEqual('section');

            var section = $(element.children()[0]);

            expect(section.children()[2]).not.toContainText('No testOrder for this patient.');
        });
    });
});