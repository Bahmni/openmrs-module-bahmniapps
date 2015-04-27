'use strict';

describe("ensure that the directive order-selector works properly", function () {

    var element, scope, conceptClass, title,httpBackend,rootScope,compile,q;

    var html = '<order-selector orders="consultation.testOrders" root-concept="concept" concept-class="conceptClass" consultation="consultation" title="title"></order-selector>';

    var concept = {
    	"conceptClass": "LabSet",
		"uuid": "3c5ea063-b6e5-48cd-b39d-dce69f00f26a",
		"name": "Blood",
		"set": true,
		"setMembers": [
			{
		    	"conceptClass": {"name" : "LabSet"},
				"uuid": "3d5ea063-b6e5-48cd-b39d-dce69f00f26a",
				"name": "CBC"
	    	},
	    	{
		    	"conceptClass": {"name" : "LabTest"},
				"uuid": "3a5ea063-b6e5-48cd-b39d-dce69f00f26a",
				"name": "ESR"
	    	}
		]
    };
    var consultation = {
    	"testOrders" : [
	    	{
				"dateCreated": "2015-04-22T19:16:13.000+0530",
				"instructions": null,
				"concept": {
					"conceptClass": "LabSet",
					"uuid": "3b5ea063-b6e5-48cd-b39d-dce69f00f26a",
					"name": "Biochemistry",
					"set": true
				},
				"voided": false,
				"dateChanged": null,
				"orderNumber": "ORD-1013",
				"uuid": "5e5b4484-7435-4600-a71d-e288c965d1db",
				"voidReason": null,
				"orderTypeUuid": "a28516de-a2a1-11e3-af88-005056821db0"
			}
		]
    };

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function($compile, $httpBackend, $rootScope, $q){
        compile = $compile;
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        q = $q;
    }));

    it("Display the Panel Orders", function () {
        conceptClass = "LabTest";
    	title = "Tests";

        scope = rootScope.$new();
        scope.consultation = consultation;
        scope.concept = concept;
        scope.conceptClass = conceptClass;
        scope.title = title;

        httpBackend.expectGET("./consultation/views/orderSelector.html").respond("<div>dummy</div>");

        var compiledEle = compile(html)(scope);

        scope.$digest();
        httpBackend.flush();

        var compiledScope = compiledEle.isolateScope();
        scope.$digest();

        expect(compiledScope).not.toBeUndefined();
        expect(compiledScope.hasOrders()).toBeTruthy();
        expect(compiledScope.filterByConceptClass(concept.setMembers[1])).toBeTruthy();
        expect(compiledScope.filterByConceptClass(concept.setMembers[0])).toBeFalsy();
        compiledScope.onSelectionChange(concept.setMembers[0]);
        expect(compiledScope.orders.length).toBe(2);
        compiledScope.onSelectionChange(concept.setMembers[0]);
        expect(compiledScope.orders.length).toBe(1);
    });
});
