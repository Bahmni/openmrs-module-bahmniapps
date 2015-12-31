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
            columns: ["drugName", "dosage", "route"]
        };
        mockBackend = $httpBackend;
        mockBackend.expectGET('../common/displaycontrols/drugOrdersSection/views/drugOrdersSection.html').respond("<div>dummy</div>");
        mockBackend.expectGET(Bahmni.Common.Constants.bahmniDrugOrderUrl + "/drugOrderDetails"+ "?patientUuid=abcd-1234").respond(drugOrders);
    }));


    it("should return all configured drug orders taken by the patient", function () {
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.drugOrders.length).toBe(drugOrders.length);
    });

    it("should initialise columns if not specified in config", function(){
        scope.params = {
            title: "Active TB Drugs"
        };
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.columns.length).toBe(9);
    });

    it("should assign Drug Orders as default title if title is not specified in config", function(){
        scope.params = {};
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.config.title).toBe("Drug Orders");

    })

});