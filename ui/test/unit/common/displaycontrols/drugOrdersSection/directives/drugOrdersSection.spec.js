'use strict';

describe('Drug Order Details DisplayControl', function () {
    var drugOrders,
        $compile,
        mockBackend,
        scope,
        params,element,
        simpleHtml = '<drug-orders-section patient-uuid="patientUuid" config="params"></drug-order-details>';


    drugOrders =[
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
            "drug": {
                "form": "Inhaler",
                "strength": null,
                "uuid": "191d09b9-fbcf-4333-8c00-d708ccd7ae88",
                "name": "Paracetemol"
            }
        }
    ];

    beforeEach(module('bahmni.clinical'));
    beforeEach(module('bahmni.common.displaycontrol.drugOrdersSection'));


    beforeEach(inject(function (_$compile_, $rootScope, $httpBackend) {
        scope = $rootScope;
        $compile = _$compile_;
        scope.patientUuid = "abcd-1234"
        scope.params = {
            title: "Active TB Drugs",
            fieldNames: ["drugName", "dosage", "route"]
        };
        mockBackend = $httpBackend;
        mockBackend.expectGET('../common/displaycontrols/drugOrdersSection/views/drugOrdersSection.html').respond("<div>dummy</div>");
        mockBackend.expectGET(Bahmni.Common.Constants.bahmniDrugOrderUrl + "/drugOrderDetails"+ "?patientUuid=abcd-1234").respond(drugOrders);
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
    }));


    it("should return all configured drug orders taken by the patient", function () {
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.drugOrders.length).toBe(drugOrders.length);
    });

    it("should toggle the showDetails when drugOrder is selected", function(){
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        var drugOrder = {};
        expect(drugOrder.showDetails).toBeFalsy();
        compiledElementScope.toggle(drugOrder);
        expect(drugOrder.showDetails).toBeTruthy();
    });

    it("should initialise column headers", function(){
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.columnHeaders.length).toBe(3);
        expect(compiledElementScope.columnHeaders[0]).toBe("DRUG_DETAILS_DRUG_NAME");
        expect(compiledElementScope.columnHeaders[1]).toBe("DRUG_DETAILS_DOSE_INFO");
        expect(compiledElementScope.columnHeaders[2]).toBe("DRUG_DETAILS_ROUTE");
    });

    it("should determine whether it should show a column", function(){
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.shouldShow("drugName")).toBeTruthy();
        expect(compiledElementScope.shouldShow("frequency")).toBeFalsy();
    })
});