'use strict';

describe("ensure that the directive order-selector works properly", function () {

    var scope, conceptClass, title,httpBackend,rootScope,compile,q;

    var html = '<order-selector></order-selector>';

    var concept = {
    	"conceptClass": "ConvSet",
		"uuid": "3c5ea063-b6e5-48cd-b39d-dce69f00f26a",
		"name": "Blood",
		"set": true,
		"setMembers": [
			{
		    	"conceptClass": {"name" : "LabSet"},
				"uuid": "3d5ea063-b6e5-48cd-b39d-dce69f00f26a",
				"name": "CBC",
                "setMembers": []
	    	},
	    	{
		    	"conceptClass": {"name" : "LabTest"},
				"uuid": "3a5ea063-b6e5-48cd-b39d-dce69f00f26a",
				"name": "ESR",
                "setMembers": []
	    	},
            {
                "conceptClass": {"name": "LabTest"},
                "uuid": "17a67549-0ba1-46bb-92eb-dca9f81fafa1",
                "name": "Packed Cell Volume (PCV)",
                "setMembers": []
            }
		]
    };

    var consultation = {
    	"orders" : [
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
        scope.group = concept.setMembers[1].conceptClass;
        scope.tab = {leftCategory: concept};

        httpBackend.expectGET("./consultation/views/orderSelector.html").respond("<div>dummy</div>");

        compile(html)(scope);

        scope.$digest();
        httpBackend.flush();

        scope.$digest();

        expect(scope).not.toBeUndefined();
        expect(scope.filterByConceptClass(concept.setMembers[1])).toBeTruthy();
        expect(scope.filterByConceptClass(concept.setMembers[0])).toBeFalsy();

        expect(scope.hasTests()).not.toBeNull();
    });

    describe("filterBySearchString",function () {
        it("should filter tests by fullName, shortName and synonym",function () {
            scope = rootScope.$new();

            httpBackend.expectGET("./consultation/views/orderSelector.html").respond("<div>dummy</div>");

            compile(html)(scope);

            scope.$digest();
            httpBackend.flush();

            scope.$digest();

            var test = {
                names: [
                    {
                        name: "fullName"
                    },
                    {
                        name: "shortname"
                    },
                    {
                        name: "synonym"
                    }
                ]
            };

            scope.search = {
                string: 'full'
            };
            expect(scope.filterBySearchString(test)).toBeTruthy();

            scope.search.string = 'short';
            expect(scope.filterBySearchString(test)).toBeTruthy();

            scope.search.string = 'syno';
            expect(scope.filterBySearchString(test)).toBeTruthy();

        });

        it("should not filter those tests whose names does not match the search string",function () {
            scope = rootScope.$new();

            httpBackend.expectGET("./consultation/views/orderSelector.html").respond("<div>dummy</div>");

            compile(html)(scope);

            scope.$digest();
            httpBackend.flush();

            scope.$digest();

            var test = {
                names: [
                    {
                        name: "fullName"
                    },
                    {
                        name: "shortname"
                    },
                    {
                        name: "synonym"
                    }
                ]
            };

            scope.search = {
                string: 'random'
            };
            expect(scope.filterBySearchString(test)).toBeFalsy();
        });

    });

});
