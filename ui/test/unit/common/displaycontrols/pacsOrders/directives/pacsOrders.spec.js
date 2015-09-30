'use strict';

describe("PacsOrdersDisplayControl", function () {
    var compile, scope, orderService, orderTypeService, spinner, orders,translateFilter;

    beforeEach(function () {
        module('bahmni.common.uiHelper');
        module('bahmni.common.displaycontrol.pacsOrders');
        module('bahmni.common.i18n');
        module('ngHtml2JsPreprocessor');

        module(function ($provide) {
            orderService = jasmine.createSpyObj('orderService', ['getOrders']);
            orderTypeService = jasmine.createSpyObj('orderTypeService', ['getOrderTypeUuid']);
            spinner = jasmine.createSpyObj('spinner', ['forPromise']);
            translateFilter = jasmine.createSpy('translateFilter');
            $provide.value('orderService', orderService);
            $provide.value('orderTypeService', orderTypeService);
            $provide.value('spinner', spinner);
            $provide.value('translateFilter',translateFilter);
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
            orders = [{
                "conceptName": "Absconding",
                "orderDate": "2014-12-16T16:06:49.000+0530",
                "provider": "someProvider",
                "bahmniObservations": []
            }];
        });

        it('should show the noOrdersMessage when there is no order', function () {

            orderService.getOrders.and.returnValue(specUtil.createFakePromise([]));
            var element = generateElement();

            expect(element.children()[0].localName).toBe('section');

            var section = $(element.children()[0]);

            expect(section.children()[2].localName).toBe('div');
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
    describe("Pacs Image Link",function(){
        beforeEach(function(){
            scope.config = {};
            scope.patient = {uuid:"patientUuid"};
            scope.section = {title: "PACS Orders Summary"};
            scope.orderType = "pacsOrder";
            orders = [{
                "conceptName": "Absconding",
                "orderDate": "2014-12-16T16:06:49.000+0530",
                "provider": "someProvider",
                "bahmniObservations": []
            }];
        });
        it('should set the pacs image link to given url template when it does not have any placeholder',function(){
            scope.config.pacsImageUrl="http://10.0.0.30:8080/";

            orderService.getOrders.and.returnValue(specUtil.createFakePromise(orders));
            var element = generateElement();

            expect(element.children()[0].localName).toBe('section');

            var pacsOrders = $(element.children()[0]);
            var ordersNavigationSection = $(pacsOrders.children()[1]);
            var allLinks = ordersNavigationSection.find('a');

            expect($(allLinks[0]).attr('href')).toBe('http://10.0.0.30:8080/');

            scope.config.pacsImageUrl="http://10.0.0.30:2020/";
            scope.$digest();
            expect($(allLinks[0]).attr('href')).toBe('http://10.0.0.30:2020/');
        });
        it('should set the pacs image link with patientID param when it\'s placeholder exists in the template', function(){

            orders[0].orderNumber="ORD-2003";
            orderService.getOrders.and.returnValue(specUtil.createFakePromise(orders));
            var element = generateElement();

            expect(element.children()[0].localName).toBe('section');

            var pacsOrders = $(element.children()[0]);
            var ordersNavigationSection = $(pacsOrders.children()[1]);
            var allLinks = ordersNavigationSection.find('a');

            expect($(allLinks[0]).attr('href')).toBeUndefined();

            scope.config.pacsImageUrl="http://10.0.0.30:8080/oviyam2/viewer.html?patientID={{patientID}}";
            scope.patient.identifier="GAN200024";
            scope.$digest();
            expect($(allLinks[0]).attr('href')).toBe('http://10.0.0.30:8080/oviyam2/viewer.html?patientID=GAN200024');

            scope.patient.identifier="GAN200025";
            scope.$digest();
            expect($(allLinks[0]).attr('href')).toBe('http://10.0.0.30:8080/oviyam2/viewer.html?patientID=GAN200025');

            scope.config.pacsImageUrl="http://10.0.0.30:.../?patientID={{patientID}}&accessionNumber={{orderNumber}}";
            scope.$digest();
            expect($(allLinks[0]).attr('href')).toBe('http://10.0.0.30:.../?patientID=GAN200025&accessionNumber=ORD-2003');
        });
        it('should open the pacs image in new tab',function(){
            orderService.getOrders.and.returnValue(specUtil.createFakePromise(orders));
            var element = generateElement();

            expect(element.children()[0].localName).toBe('section');

            var pacsOrders = $(element.children()[0]);
            var ordersNavigationSection = $(pacsOrders.children()[1]);
            var allLinks = ordersNavigationSection.find('a');

            expect($(allLinks[0]).attr('target')).toBe("_blank");
        });
    });
});