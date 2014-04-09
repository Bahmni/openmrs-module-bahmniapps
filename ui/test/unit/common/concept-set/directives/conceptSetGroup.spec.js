'use strict';

describe("ConceptSetGroupController", function() {
	var scope, appService, appDescriptor;
	beforeEach(module('bahmni.common.conceptSet'));

	beforeEach(inject(function ($injector) {
        var $controller = $injector.get('$controller');
        scope = $injector.get('$rootScope').$new();
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appDescriptor = jasmine.createSpyObj('appDescriptor', ['getExtensions']);
        appService.getAppDescriptor.andReturn(appDescriptor);
        $controller('ConceptSetGroupController', {
        	$scope: scope,
        	appService: appService
        });
    }));

    describe("showConceptSet", function() {
		it("should be true if 'showIf' condition is not defined in extension params", function() {
			expect(scope.showConceptSet({})).toBe(true);
			expect(scope.showConceptSet({extensionParams: {}})).toBe(true);
			expect(scope.showConceptSet({extensionParams: { showIf: null }})).toBe(true);
		});

		it("should be false if 'showIf' condition returns false", function() {
			var extension = {extensionParams: { showIf: ["return false;"] }}

			expect(scope.showConceptSet(extension)).toBe(false);
		});

		it("should be true if 'showIf' condition returns true", function() {
			var extension = {extensionParams: { showIf: ["return true;"] }}

			expect(scope.showConceptSet(extension)).toBe(true);
		});

		it("should be pass the context to the showIf function", function() {
			scope.context = {vistitTypeName: 'OPD', patient: {gender: 'M'} };
			var extension = {extensionParams: { 
				showIf: ["if(context.vistitTypeName === 'OPD' && context.patient.gender === 'M')", 
							"return true;",
						 "else",
						 	"return false;"
						] 
			}};

			expect(scope.showConceptSet(extension)).toBe(true);
		});
    });
});