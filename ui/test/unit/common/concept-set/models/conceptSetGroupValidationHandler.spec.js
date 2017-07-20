'use strict';

describe("Concept Set group validation handler", function() {
    var conceptSetSections = [
        {
            name: {name: "vitals"},
            isLoaded : true,
            show : jasmine.createSpy()
        }
    ];

    it("should push to a list of validations on add & return false", function() {
        var fun1 = function () {
            return {allow : true};
        };

        var fun2 = function () {
            return {allow : false, errorMessage : 'Error Message1'};
        };

        var validationHandler = new Bahmni.ConceptSet.ConceptSetGroupValidationHandler(conceptSetSections);
        validationHandler.add(fun1);
        validationHandler.add(fun2);

        var validateRet = validationHandler.validate();
        expect(validateRet.allow).toBeFalsy();
        expect(validateRet.errorMessage).toBe('Error Message1');
        expect(conceptSetSections[0].show).toHaveBeenCalled();
    });

    it("should push to a list of validations on add", function() {
        var fun1 = function () {
            return {allow : true};
        };

        var fun2 = function () {
            return {allow : true, errorMessage : 'Error Message1'};
        };

        var fun3 = function () {
            return {allow : true, errorMessage : 'Error Message2'};
        };

        var validationHandler = new Bahmni.ConceptSet.ConceptSetGroupValidationHandler([]);
        validationHandler.add(fun1);
        validationHandler.add(fun2);
        validationHandler.add(fun3);

        var validateRet = validationHandler.validate();
        expect(validateRet.allow).toBeTruthy();
        expect(validateRet.errorMessage).toBe('Error Message1');
    });
});
