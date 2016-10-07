'use strict';

describe("PacsOrdersDisplayControl", function () {
    var compile, scope, orderService, orderTypeService, spinner, orders,translateFilter, q, messagingService, $window;

    beforeEach(function () {
        module('bahmni.common.uiHelper');
        module('bahmni.common.displaycontrol.pacsOrders');
        module('bahmni.common.i18n');
        module('ngHtml2JsPreprocessor');

        module(function ($provide) {
            orderService = jasmine.createSpyObj('orderService', ['getOrders']);
            orderTypeService = jasmine.createSpyObj('orderTypeService', ['getOrderTypeUuid']);
            messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
            spinner = jasmine.createSpyObj('spinner', ['forPromise', 'forAjaxPromise']);
            translateFilter = jasmine.createSpy('translateFilter');
            $window = jasmine.createSpyObj('$window', ['open']);
            $provide.value('orderService', orderService);
            $provide.value('orderTypeService', orderTypeService);
            $provide.value('spinner', spinner);
            $provide.value('translateFilter',translateFilter);
            $provide.value('messagingService',messagingService);
            $provide.value('$window',$window);
        });
        inject(function ($compile, $rootScope, $q) {
            compile = $compile;
            scope = $rootScope.$new();
            q = $q;
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
        generateElement();

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
            scope.patient = {uuid:"patientUuid", identifier: "GAN293345"};
            scope.section = {title: "PACS Orders Summary"};
            scope.orderType = "pacsOrder";
            orders = [{
                "conceptName": "Absconding",
                "orderDate": "2014-12-16T16:06:49.000+0530",
                "provider": "someProvider",
                orderNumber: "ORD-2003",
                "bahmniObservations": []
            }];
        });
        it('should set the pacs image link to given url template when it does not have any placeholder',function(){
            scope.config.pacsImageUrl="http://localhost:8001/oviyam2/viewer.html?patientID={{patientID}}&accessionNumber={{orderNumber}}";

            orderService.getOrders.and.callFake(function () {
                var deferred = q.defer();
                deferred.resolve({data: orders});
                return deferred.promise;
            });
            generateElement();

            scope.$digest();

            expect(orders[0].pacsImageUrl).toBe("http://localhost:8001/oviyam2/viewer.html?patientID=GAN293345&accessionNumber=ORD-2003")
        });

        it('should display message saying image not available when the image link is not servicable (when image is not available)', function(){
            scope.config.pacsImageUrl="http://localhost:8001/oviyam2/viewer.html?patientID={{patientID}}&accessionNumber={{orderNumber}}";

            orderService.getOrders.and.callFake(function () {
                var deferred = q.defer();
                deferred.resolve({data: orders});
                return deferred.promise;
            });

            spyOn($, 'ajax').and.callFake(function(){
                var d = $.Deferred();
                d.reject({});
                return d.promise();
            });

            var element = generateElement();
            var isolateScope = element.isolateScope();
            isolateScope.openImage(orders[0]);

            expect(messagingService.showMessage).toHaveBeenCalledWith("info", "No image available yet for order: Absconding")
        });

        it('should open image in new tab  when the image link is  servicable (when image is available)', function(){
            scope.config.pacsImageUrl="http://localhost:8001/oviyam2/viewer.html?patientID={{patientID}}&accessionNumber={{orderNumber}}";

            orderService.getOrders.and.callFake(function () {
                var deferred = q.defer();
                deferred.resolve({data: orders});
                return deferred.promise;
            });

            spyOn($, 'ajax').and.callFake(function(){
                var d = $.Deferred();
                d.resolve({});
                return d.promise();
            });

            var element = generateElement();
            var isolateScope = element.isolateScope();
            isolateScope.openImage(orders[0]);

            expect($window.open).toHaveBeenCalledWith('http://localhost:8001/oviyam2/viewer.html?patientID=GAN293345&accessionNumber=ORD-2003', '_blank')
        });
    });

});