'use strict';

describe('Treatment Table DisplayControl', function () {
    var drugOrderSections,
        compile,
        mockBackend,
        rootScope,
        params,
        simpleHtml = '<treatment-table drug-order-sections="treatmentSections" params="params"></treatment-table>';

    var otherActiveDrugOrderSection = {
        "visitDate": Bahmni.Clinical.Constants.otherActiveDrugOrders,
        "drugOrders": []
    };
    var visitDrugOrder = {
        "visitDate": "1418888025000",
        "drugOrders": []
    };
    drugOrderSections = [
        visitDrugOrder,
        otherActiveDrugOrderSection
    ];

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(['$compile', '$httpBackend', '$rootScope', function ($compile, $httpBackend, $rootScope) {
        compile = $compile;
        mockBackend = $httpBackend;
        rootScope = $rootScope;
    }]));

    it("should return true if the section is other active drug orders", function () {
        var scope = rootScope.$new();

        scope.params = {
            showListView: true
        };

        scope.treatmentSections = drugOrderSections;

        mockBackend.expectGET('displaycontrols/treatmentData/views/treatmentTable.html').respond("<div>dummy</div>");
        var element = compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();

        expect(compiledElementScope.isOtherActiveSection(otherActiveDrugOrderSection.visitDate)).toBe(true)
    });

    it("should return false if the section is not other active drug orders", function () {
        var scope = rootScope.$new();

        scope.params = {
            showListView: true
        };

        scope.treatmentSections = drugOrderSections;

        mockBackend.expectGET('displaycontrols/treatmentData/views/treatmentTable.html').respond("<div>dummy</div>");
        var element = compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();

        expect(compiledElementScope.isOtherActiveSection(visitDrugOrder.visitDate)).toBe(false)
    })


});