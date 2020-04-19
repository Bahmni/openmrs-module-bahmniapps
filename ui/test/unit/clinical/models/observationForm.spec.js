'use strict';

describe("ObservationForm", function () {
    var ObservationForm = Bahmni.ObservationForm;
    var dummyUser = {isFavouriteObsTemplate: function(){}};
    var event = { stopPropagation: function () {
        return;
    }};

    describe('init', function () {

        it("should have isOpen set to false if there are no obs recorded", function () {
            var observationForm = new ObservationForm('uuid', dummyUser, 'formName', '1', []);
            expect(observationForm.isOpen).toBe(false);
            expect(observationForm.options).toEqual({});
        });

        it("should have isOpen set to true if there are obs recorded", function () {
            var observations = [
                {
                    value: 10,
                    concept:{
                        name:"Pulse"
                    },
                    formFieldPath: "formName.1/101"
                }];
            var observationForm = new ObservationForm('uuid', dummyUser, 'formName', '1', observations);
            expect(observationForm.isOpen).toBe(true);
        });

        it("should have set formUuid and formName and version", function () {
            var observationForm = new ObservationForm('uuid', dummyUser, 'name', '1');
            expect(observationForm.formName).toBe('name');
            expect(observationForm.formUuid).toBe('uuid');
            expect(observationForm.formVersion).toBe('1');
        });

        it("should have set label", function () {
            var observationForm = new ObservationForm('uuid', dummyUser, 'name', '1', [], 'label value');
            expect(observationForm.label).toBe('label value');

        });
        it("should have collapseInerSections to be false by default", function(){
            var observationForm = new ObservationForm('uuid', dummyUser, 'form', '1', []);
            expect(observationForm.collapseInnerSections.value).toBe(false);
        });

        it("should set collapseInerSections to true on call of minimizeInnerSections", function() {
            var observationForm = new ObservationForm('uuid', dummyUser, 'form', '1', []);
            expect(observationForm.collapseInnerSections.value).toBe(false);

            observationForm.minimizeInnerSections(event);
            expect(observationForm.collapseInnerSections.value).toBe(true);
        });

        it("should set collapseInerSections to false on call of maximizeInnerSections", function() {
            var observationForm = new ObservationForm('uuid', dummyUser, 'form', '1', []);
            expect(observationForm.collapseInnerSections.value).toBe(false);

            observationForm.maximizeInnerSections(event);
            expect(observationForm.collapseInnerSections.value).toBe(false);
        });

        it("should have set options if extensions are passed", function () {
            var extension = {
                extensionParams: {
                    conceptNames: ["Pulse"]
                }
            };
            var observationForm = new ObservationForm('uuid', dummyUser, 'formName', '1', [], 'formName', extension);
            expect(observationForm.isOpen).toBe(false);
            expect(observationForm.options).toEqual(extension.extensionParams);
        });

        it("should have isAdded set to false if there are obs recorded and added is false", function () {
            var observations = [
                {
                    value: 10,
                    concept: {
                        name: "Pulse"
                    },
                    formFieldPath: "formName.1/101"
                }];
            var observationForm = new ObservationForm('uuid', dummyUser, 'formName', '1', observations);
            observationForm.isAdded = false;
            expect(observationForm.isAdded).toBe(false);
        });
    });

    describe('toggleDisplay', function () {
        it("should set isOpen as true first time", function () {
            var observationForm = new ObservationForm('uuid', dummyUser, 'name', '1');
            expect(observationForm.isOpen).toBe(false);
            observationForm.toggleDisplay();
            expect(observationForm.isOpen).toBe(true);
        });

        it("set isOpen as false when it was previously open", function () {
            var observationForm = new ObservationForm('uuid', dummyUser, 'name', '1');
            observationForm.toggleDisplay();
            expect(observationForm.isOpen).toBe(true);
            observationForm.toggleDisplay();
            expect(observationForm.isOpen).toBe(false);
        });
    });
});
