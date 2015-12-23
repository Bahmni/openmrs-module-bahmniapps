'use strict';

describe('Drug Order Details DisplayControl', function () {
    var drugOrderSections,
        $compile,
        mockBackend,
        scope,
        params,element,
        simpleHtml = '<drug-order-details id="dashboard-drug-order-details" patient="patient" section="params"></drug-order-details>';


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
        },
        {
            "action": "DISCONTINUE",
            "uuid": "3279ccd2-9e57-4a4f-a79a-66e1538ea6c6",
            "dosingInstructions": {
                "administrationInstructions": "{\"instructions\":\"Immediately\"}"
            },
            "dateStopped":"21-05-2012",
            "drug": {
                "form": "Inhaler",
                "strength": null,
                "uuid": "191d09b9-fbcf-4333-8c00-d708ccd7ae88",
                "name": "Paracetemol"
            }
        }
    ];

    beforeEach(module('bahmni.clinical'));
    beforeEach(module('bahmni.common.displaycontrol.drugOrderDetails'));


    beforeEach(inject(function (_$compile_, $rootScope, $httpBackend) {
        scope = $rootScope;
        $compile = _$compile_;
        scope.patient= {uuid:'123'};
        scope.params = {dashboardParams:{}};
        mockBackend = $httpBackend;
        mockBackend.expectGET('../common/displaycontrols/drugOrderDetails/views/drugOrderDetails.html').respond("<div>dummy</div>");
        mockBackend.expectGET(Bahmni.Common.Constants.bahmniDrugOrderUrl + "/drugOrderDetails"+ "?patientUuid=123").respond(drugOrderSections);
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

    it("should filter inactive drug orders when configured to not show them", function(){
        scope.params = {dashboardParams:{showOnlyActive:true}};
        mockBackend.expectGET(Bahmni.Common.Constants.bahmniDrugOrderUrl + "/drugOrderDetails"+ "?patientUuid=123").respond(drugOrderSections);
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.drugOrders.length).toBe(1);
    });
});