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
