'use strict';

describe("ConceptSetObservation", function() {
    it("should copy value from savedObs", function() {
        expect(new Bahmni.ConceptSet.Observation({concept: {name: "someConcept"}}, {value: "someValue"}, {}).value).toBe("someValue");
        expect(new Bahmni.ConceptSet.Observation({concept: {name: "someConcept"}}, null, {}).value).toEqual(undefined);
    });

    it("should return display value", function() {
        var obs = new Bahmni.ConceptSet.Observation({concept: {name: "someConcept"}, possibleAnswers: []}, {value: "UUID2"}, {}); 
        expect(obs.displayValue()).toEqual("UUID2");
    });

    it("should return display value for answer if coded", function() {
        var obs = new Bahmni.ConceptSet.Observation({
            concept: {name: "someConcept"},
            possibleAnswers: [{uuid: "UUID1", display: "ANSWER1"}, {uuid: "UUID2", display: "ANSWER2"}],
        }, {value: "UUID2"}, {});
        expect(obs.displayValue()).toEqual("ANSWER2");
    });

    it("should be group if group members are present", function() {
        expect(new Bahmni.ConceptSet.Observation({concept: {name: "someConcept"}, groupMembers: [{}]}, null, {}).isGroup()).toBeTruthy();
        expect(new Bahmni.ConceptSet.Observation({concept: {name: "someConcept"}, groupMembers: []}, null, {}).isGroup()).toBeFalsy();
        expect(new Bahmni.ConceptSet.Observation({concept: {name: "someConcept"}, groupMembers: null}, null, {}).isGroup()).toBeFalsy();
    });

    it("should be computed if concept class is computed", function() {
        expect(new Bahmni.ConceptSet.Observation({concept: {name: "someConcept", conceptClass: "Computed"}}, null, {}).isComputed()).toBeTruthy();
        expect(new Bahmni.ConceptSet.Observation({concept: {name: "someConcept", conceptClass: "NotComputed"}}, null, {}).isComputed()).toBeFalsy();
    });

    it("should be numeric if concept datatype is numeric", function() {
        expect(new Bahmni.ConceptSet.Observation({concept: {name: "someConcept", dataType: "Numeric"}}, null, {}).isNumeric()).toBeTruthy();
        expect(new Bahmni.ConceptSet.Observation({concept: {name: "someConcept", dataType: "text"}}, null, {}).isNumeric()).toBeFalsy();
    });

    it("should not be valid if observation value goes beyond absolute range", function() {
        var obs = new Bahmni.ConceptSet.Observation({
            concept: {name: "someConcept", dataType: "Numeric", hiAbsolute: 100, lowAbsolute: 90, value: 101}
        }, null, {});
        obs.value = 102;
        expect(obs.isValid(false, false)).toBeFalsy();
     });

    it("should not be valid if observations child node value goes beyond absolute range", function() {
        var grpMem = new Bahmni.ConceptSet.Observation({concept: {name: "someConcept",dataType: "Numeric",hiAbsolute: 100,
            lowAbsolute: 90, value:101}}, null, {});
        grpMem.value = 102;
        var obs = new Bahmni.ConceptSet.Observation({
            concept: {name: "Blood Pressure",dataType: "N/A",hiAbsolute: null, lowAbsolute: null},
            groupMembers: [grpMem]
        }, null, {});

        expect(obs.isValueInAbsoluteRange()).toBeFalsy();
    });

    it("should by default show notes button when nothing configured", function() {
        var requiredObservation = new Bahmni.ConceptSet.Observation({concept: {name: "someConcept",dataType: "Numeric",hiAbsolute: 100,
            lowAbsolute: 90, value:101}}, null, {})
        expect(requiredObservation.canHaveComment()).toBeTruthy();
    });

    it("should hide notes button when configured to not show", function() {
        var requiredObservation = new Bahmni.ConceptSet.Observation({concept: {name: "someConcept",dataType: "Numeric",hiAbsolute: 100,
            lowAbsolute: 90, value:101}}, null, {"someConcept":{"disableAddNotes" : true}})
        expect(requiredObservation.canHaveComment()).toBeFalsy();
    });

    it("should allow future date the value is computed", function() {
        var obs = new Bahmni.ConceptSet.Observation({
            concept: {name: "someConcept", dataType: "Date", conceptClass: 'Computed'}
        }, {value: "2116-11-16"}, {});
        expect(obs.isValidDate()).toBeTruthy();
    });

    it("should not allow future date if allowFutureDates is set to false and the value is not computed", function() {
        var obs = new Bahmni.ConceptSet.Observation({
            concept: {name: "someConcept",dataType: "Date"}
        }, {value:"2116-11-16"}, {
            allowFutureDates: false
        });
        expect(obs.isValidDate()).toBeFalsy();
    });

    it("should allow future date time if the value is computed", function() {
        var obs = new Bahmni.ConceptSet.Observation({
            concept: {name: "someConcept", dataType: "Datetime", conceptClass: 'Computed'}
        }, {value: "2116-02-09 01:00:00"}, {});
        expect(obs.hasInvalidDateTime()).toBeFalsy();
    });

    it("should not allow future date time if allowFutureDates is set to false and the value is not computed", function() {
        var obs = new Bahmni.ConceptSet.Observation({
            concept: {name: "someConcept",dataType: "Datetime"}
        }, {value:"2116-02-09 01:00:00"}, {
            allowFutureDates: false
        });
        expect(obs.hasInvalidDateTime()).toBeTruthy();
    });

    it("should clone the observation with order and hidden fields in place and link tabularObs to conceptSetObs", function () {
        var obs4 = new Bahmni.ConceptSet.Observation({
                concept: {name: "someConcept4", dataType: "Text"},
                groupMembers: []
            },
            {value: "2116-01-09 01:00:00"}, {
                allowFutureDates: true
            });

        var obs1 = new Bahmni.ConceptSet.Observation({
            concept: {name: "someConcept3", dataType: "Datetime"},
            groupMembers: [obs4]
        }, {value: "2116-01-09 01:00:00"}, {
            allowFutureDates: true
        });

        var obs3 = new Bahmni.ConceptSet.TabularObservations([{
            concept: {name: "someConcept3", dataType: "Datetime"},
            groupMembers: [obs4]
        }], {value: "2116-01-09 01:00:00"}, {
            allowFutureDates: true,
            isTabular: true
        });

        var obs2 = new Bahmni.ConceptSet.Observation({
                concept: {name: "someConcept2", dataType: "Text"},
                groupMembers: []
            },
            {value: "2116-01-09 01:00:00"}, {
                allowFutureDates: true
            });

        var obs = new Bahmni.ConceptSet.Observation({
            concept: {name: "someConcept", dataType: "Datetime"},
            groupMembers: [obs1, obs2, obs3],
            hidden: true
        }, {value: "2116-02-09 01:00:00"}, {
            allowFutureDates: false
        });

        var clone = obs.cloneNew();
        expect(clone.groupMembers.length).toBe(3);
        expect(clone.hidden).toBeTruthy();

        expect(clone.groupMembers[0].concept.name).toBe(obs1.concept.name);
        expect(clone.groupMembers[0].groupMembers[0].uniqueId).toBe(clone.groupMembers[2].rows[0].cells[0].uniqueId);

    });

    it("should set atleastOneValueSet to true for observations with non voided values only", function () {
       var observation = new Bahmni.ConceptSet.Observation({
           concept: {name: "Documents, Image", dataType: "Image"}, value: "300/223-Consultation-4a945e65-f950-40e0-9c67-7b166706fcef.jpeg", voided: true
       }, {}, {});

        expect(observation.atLeastOneValueSet()).toBeFalsy();
        expect(observation.voided).toBeTruthy();
    });

    describe("autocomplete",function(){
        var conceptUIConfig = {
            "some autocomplete": {
                autocomplete: true
            }
        };
        var baseObservation = {
            concept: {
                name: "some autocomplete",
                dataType: "Coded"
            }
        };
        it("should be a valid observation if the value is selected from autocomplete", function () {
            var observation = new Bahmni.ConceptSet.Observation(baseObservation, null, conceptUIConfig);

            expect(observation.isValid()).toBeTruthy();
            observation.value = {
                name: "some selected value"
            };
            expect(observation.isValid()).toBeTruthy();
        });

        it("should be a invalid observation if the value is not selected from autocomplete", function () {
            var observation = new Bahmni.ConceptSet.Observation(baseObservation, null, conceptUIConfig);

            observation.value = "someValue";
            expect(observation.isValid()).toBeFalsy()
        });

    });

    describe("Numeric allowDecimal", function () {
        var numericObservation = {
            concept: {
                name: "Systolic",
                dataType: "Numeric",
                hiAbsolute: 100,
                lowAbsolute: 30
            }
        };


        it ("should be a valid observation if value is integer and allow decimal is false and value is within absolute range", function () {
            numericObservation.concept.allowDecimal = false;
            var observation = new Bahmni.ConceptSet.Observation(numericObservation, null, {});
            observation.value = 70;
            expect(observation.isValid()).toBeTruthy();
        });

        it ("should be a valid observation if value is integer and allow decimal is true and value is within absolute range", function () {
            numericObservation.concept.allowDecimal = true;
            var observation = new Bahmni.ConceptSet.Observation(numericObservation, null, {});
            observation.value = 70;
            expect(observation.isValid()).toBeTruthy();
        });

        it ("should be a valid observation if value is decimal and allow decimal is true and value is within absolute range", function () {
            numericObservation.concept.allowDecimal = true;
            var observation = new Bahmni.ConceptSet.Observation(numericObservation, null, {});
            observation.value = 70.5;
            expect(observation.isValid()).toBeTruthy();
        });

        it ("should be an invalid observation if value is decimal and allow decimal is false", function () {
            numericObservation.concept.allowDecimal = false;
            var observation = new Bahmni.ConceptSet.Observation(numericObservation, null, {});
            observation.value = 70.5;
            expect(observation.isValid()).toBeFalsy();
        });

        it ("should be an invalid observation if value is integer and allow decimal is false but beyond absolute range", function () {
            numericObservation.concept.allowDecimal = false;
            var observation = new Bahmni.ConceptSet.Observation(numericObservation, null, {});
            observation.value = 170;
            expect(observation.isValid()).toBeFalsy();
            observation.value = 24;
            expect(observation.isValid()).toBeFalsy();
        });

        it ("should be an invalid observation if value is decimal and allow decimal is true but beyond absolute range", function () {
            numericObservation.concept.allowDecimal = true;
            var observation = new Bahmni.ConceptSet.Observation(numericObservation, null, {});
            observation.value = 170.6;
            expect(observation.isValid()).toBeFalsy();
            observation.value = 24.3;
            expect(observation.isValid()).toBeFalsy();
        });
    })
});
