'use strict';

describe("Concept Set group validation handler", function() {
    var conceptSetSections = [
        {
            name: {name: "vitals1"},
            isLoaded : true,
            show : jasmine.createSpy()
        },
        {
            name: {name: "vitals2"},
            isLoaded : true,
            show : jasmine.createSpy()
        },
        {
            name: {name: "vitals3"},
            isLoaded : true,
            show : jasmine.createSpy()
        }
    ];

    it("should push to a list of validations on add", function() {

        var fun1 = function () {
            return {allow : true};
        };
        var fun2 = "function3";

        var fun3 = function () {
            return {allow : false, errorMessage : 'Error Message1'};
        };


        var validationHandler = new Bahmni.ConceptSet.ConceptSetGroupPanelViewValidationHandler(conceptSetSections);
        conceptSetSections[0].klass = "active";
        validationHandler.add(fun1);
        conceptSetSections[0].klass = "";
        conceptSetSections[1].klass = "active";
        validationHandler.add(fun2);
        conceptSetSections[1].klass = "";
        conceptSetSections[2].klass = "active";
        validationHandler.add(fun3);

        var validateRet = validationHandler.validate();
        expect(validateRet.allow).toBeFalsy();
        expect(validateRet.errorMessage).toBe('Error Message1');
        expect(conceptSetSections[0].isValid).toBeTruthy();
        expect(conceptSetSections[1].isValid).toBeUndefined();
        expect(conceptSetSections[2].isValid).toBeFalsy();
        expect(conceptSetSections[2].show).toHaveBeenCalled();
        expect(conceptSetSections[2].errorMessage).toBe('Error Message1');
        expect(conceptSetSections[1].errorMessage).toBeUndefined();
        expect(typeof conceptSetSections[2].validate).toBe('function');
        expect(typeof conceptSetSections[0].validate).toBe('function');

    });

    it("shouldn't add validations & return true", function() {

        var fun1 = function () {
            return {allow : true};
        };

        var validationHandler = new Bahmni.ConceptSet.ConceptSetGroupPanelViewValidationHandler([]);
        validationHandler.add(fun1);

        var validateRet = validationHandler.validate();
        expect(validateRet.allow).toBeTruthy();
        expect(validateRet.errorMessage).toBe('');
    });
});
