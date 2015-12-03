'use strict';

describe('Drug Order Details DisplayControl', function () {
    var drugOrderSections,
        $compile,
        mockBackend,
        scope,
        params,
        simpleHtml = '<drug-order-details id="dashboard-drug-order-details" params="params"></drug-order-details>';
    var element;


    beforeEach(module('bahmni.clinical'));


    drugOrderSections =[
        {
            "action": "NEW",
            "uuid": "3279ccd2-9e57-4a4f-a79a-66e1538ea6c6",
            "dosingInstructions": {
                "administrationInstructions": "{\"instructions\":\"Immediately\"}"
            },
            "drug": {
                "form": "Inhaler",
                "strength": null,
                "uuid": "191d09b9-fbcf-4333-8c00-d708ccd7ae88",
                "name": "Ipratropium Pressurised"
            }
        }
    ];



    beforeEach(inject(function (_$compile_, $rootScope, $httpBackend) {
        scope = $rootScope;
        $compile = _$compile_;
        scope.patientUuid = '123';
        scope.params = {};
        mockBackend = $httpBackend;
        mockBackend.expectGET('displaycontrols/drugOrderDetails/views/drugOrderDetails.html').respond("<div>dummy</div>");
        mockBackend.expectGET(Bahmni.Common.Constants.bahmniDrugOrderUrl + "/drugOrderDetails").respond(drugOrderSections);
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
    }));


    it("should return all configured drug orders taken by the patient", function () {
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.drugOrders.length).toBe(drugOrderSections.length);
    });

    it("should toggle the showDetails when drugOrder is selected", function(){
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        var drugOrder = {};
        expect(drugOrder.showDetails).toBeFalsy();
        compiledElementScope.toggle(drugOrder)
        expect(drugOrder.showDetails).toBeTruthy();
    });
});