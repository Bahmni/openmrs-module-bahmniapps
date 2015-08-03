'use strict';

describe("PacsOrdersDisplayControl", function () {
    var compile, scope, orderService, orderTypeService, spinner, orders;

    beforeEach(function () {
        module('bahmni.common.uiHelper');
        module('bahmni.common.displaycontrol.pacsOrders');
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
            '<pacs-orders ' +
            'patient="patient" ' +
            'section="section" ' +
            'order-type="orderType" ' +
            'order-uuid="orderUuid" ' +
            'config="config" ' +
            '></pacs-orders>';

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

        expect(orderService.getOrders.calls.mostRecent().args[0].orderUuid).toBe("someOrderUuid");
    });

    it('should have children 1 section', function () {

        orderService.getOrders.and.returnValue(specUtil.createFakePromise(orders));
        var element = generateElement();

        expect(element.children()[0].localName).toBe('section');
    });

    it('section should have children 1 h2 and 1 section', function () {

        orderService.getOrders.and.returnValue(specUtil.createFakePromise(orders));
        var element = generateElement();

        expect(element.children()[0].localName).toBe('section');

        var section = $(element.children()[0]);

        expect(section.children()[0].localName).toBe('h2');
        expect(section.children()[1].localName).toBe('section');
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

            expect(section.children()[2].localName).toBe('div');
            expect($(section.children()[2]).text()).not.toContain("No testOrder for this patient.");
        });
    });
});