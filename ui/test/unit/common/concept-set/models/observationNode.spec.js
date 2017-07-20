'use strict';

describe("ObservationNode", function () {
    var headache = buildConcept("Headache", [], []);
    var chiefComplaint = buildConcept("Chief Complaint", [], [], "Computed", "Coded");
    var duration = buildConcept("Chief Complaint Duration", [], [], "Duration", "Numeric");
    var abnormal = buildConcept("Chief Complaint Abnormal", [], [], "Abnormal", "Boolean");
    var unknown = buildConcept("Chief Complaint Unknown", [], [], "Unknown", "Boolean");
    var chiefComplaintData = buildConcept("Chief Complaint Data", [chiefComplaint, duration, abnormal, unknown], [], "Concept Details");

    function createSavedObs() {
        return [{
            "concept": chiefComplaintData,
            "label": "Chief Complaint Data",
            "groupMembers": [{
                "concept": chiefComplaint,
                "label": "Chief Complaint",
                "groupMembers": [],
                "value": headache,
                "voided": false
            }, {
                "concept": duration,
                "label": "Duration",
                "groupMembers": [],
                "value": 30,
                "voided": false
            }, {
                "concept": abnormal,
                "label": "Abnormal",
                "groupMembers": [],
                "value": true,
                "voided": false
            }, {
                "concept": unknown,
                "label": "Unknown",
                "groupMembers": [],
                "value": false,
                "voided": false
            }],
            "comment": null,
            "voided": false
        }];
    }

    var savedObs = createSavedObs();
    var rootConcept = savedObs[0].concept;
    var mapper = new Bahmni.ConceptSet.ObservationMapper();

    describe("getControlType", function () {
        it("should return freeTextAutocomplete if configured", function () {
            var obsNode = mapper.map(savedObs, rootConcept, {"Chief Complaint Data": {
                autocomplete: true,
                nonCodedConceptName:"Non Coded Chief Complaint",
                codedConceptName:"Chief Complaint"
            }});
            expect(obsNode.getControlType()).toBe("freeTextAutocomplete");
            expect(obsNode.primaryObs.concept.name).toEqual(chiefComplaint.name.name);
        });

        it("should return autocomplete if configured", function () {
            var obsNode = mapper.map(savedObs, rootConcept, {"Chief Complaint Data": {
                autocomplete: true
            }});
            expect(obsNode.getControlType()).toBe("autocomplete");
            obsNode = mapper.map(savedObs, rootConcept, {"Chief Complaint Data": {
                autocomplete: true,
                nonCodedConceptName:"Non Coded Chief Complaint"
            }});
            expect(obsNode.getControlType()).toBe("autocomplete");
            obsNode = mapper.map(savedObs, rootConcept, {"Chief Complaint Data": {
                autocomplete: true,
                codedConceptName:"Chief Complaint"
            }});
            expect(obsNode.getControlType()).toBe("autocomplete");
        });

        it("should return html5data type if primaryObs datatype is Date,Numeric or Datetime",function(){
            var obsNode = mapper.map(savedObs, rootConcept);
            obsNode.primaryObs.concept.dataType = "Date";

            expect(obsNode.getControlType()).toBe("html5InputDataType");
        });
        
        it("should return text datatype if primaryObs is of text datatype", function(){
            var obsNode = mapper.map(savedObs, rootConcept);
            obsNode.primaryObs.concept.dataType = "Text";

            expect(obsNode.getControlType()).toBe("text");
        });

        it("should return buttonselect if nothing is configured",function(){
            var obsNode = mapper.map(savedObs, rootConcept);
            obsNode.primaryObs.concept.dataType = "N/A";

            expect(obsNode.getControlType()).toBe("buttonselect");
        })
    });

    describe("PrimaryObs", function () {
        it("should return obs which is not Abnormal Obs or Duration", function () {
            var obsNode = mapper.map(savedObs, rootConcept, {"Chief Complaint Data": {freeTextAutocomplete: true}});
            expect(obsNode.primaryObs.concept.uuid).toEqual(chiefComplaint.uuid);
            expect(obsNode.abnormalObs.concept.uuid).toEqual(abnormal.uuid);
            expect(obsNode.durationObs.concept.uuid).toEqual(duration.uuid);
            expect(obsNode.unknownObs.concept.uuid).toEqual(unknown.uuid);
        });

        it("isComputed to be true if primaryObs is computed", function () {
            var obsNode = mapper.map(savedObs, rootConcept, {"Chief Complaint Data": {freeTextAutocomplete: true}});
            expect(obsNode.isComputed()).toBeTruthy();
        });
    });

    describe("autocomplete isValid",function(){

        it("should be a valid observation if the value is selected from autocomplete", function () {
            var observation = mapper.map(savedObs, rootConcept, {"Chief Complaint Data": {autocomplete: true}});

            expect(observation.isValid()).toBeTruthy();
            observation.primaryObs.value = {
                name: "some concept"
            };

            expect(observation.isValid()).toBeTruthy();
        });

        it("should be a invalid observation if the value is not selected from autocomplete", function () {
            var observation = mapper.map(savedObs, rootConcept, {"Chief Complaint Data": {autocomplete: true}});

            observation.primaryObs.value = "someValue";
            expect(observation.isValid()).toBeFalsy()
        });

    });

    describe("onValueChanged", function(){
        it("should set abnormalObs value and erroneousValue to undefined if primaryObs value is not present and abnormalObs is set", function(){
            var obsNode = mapper.map([{}], rootConcept, {"Chief Complaint Data": {freeTextAutocomplete: true}});
            expect(obsNode.abnormalObs.value).toBeUndefined();
            expect(obsNode.abnormalObs.erroneousValue).toBeUndefined()
        });

        it("should call setAbnormal when primaryObs is numeric and has value and it is abnormal", function() {
            var pulse = buildConcept("Pulse", [], [], "Misc", "Numeric");
            var abnormal = buildConcept("Pulse Abnormal", [], [], "Abnormal", "Boolean");
            var unknown = buildConcept("Pulse Unknown", [], [], "Unknown", "Boolean");

            var pulseData = buildConcept("Pulse Data", [pulse, abnormal, unknown], [], "Concept Details");

            var observations = [{
                concept: pulseData,
                label: "Pulse",
                groupMembers: [
                    {
                        "concept": pulse,
                        "label": "Pulse",
                        "groupMembers": [],
                        "value": 72,
                        "voided": false
                    },
                    {
                        "concept": abnormal,
                        "label": "Abnormal",
                        "groupMembers": [],
                        "value": true,
                        "voided": false
                    }
                ],
                "voided": false
            }];
            var obsNode = mapper.map(observations, pulseData, {});

            expect(obsNode.abnormalObs.value).toBeTruthy();
            expect(obsNode.abnormalObs.erroneousValue).toBeFalsy();
            expect(obsNode.unknownObs.value).toBeUndefined()
        });
    });

    describe("Numeric allowDecimal", function () {
        var pulse = buildConcept("Pulse", [], [], "Misc", "Numeric");
        pulse.hiAbsolute = 100;
        pulse.lowAbsolute =30;
        var abnormal = buildConcept("Pulse Abnormal", [], [], "Abnormal", "Boolean");
        var unknown = buildConcept("Pulse Unknown", [], [], "Unknown", "Boolean");

        var pulseData = buildConcept("Pulse Data", [pulse, abnormal, unknown], [], "Concept Details");

        var observations = [{
            concept: pulseData,
            label: "Pulse",
            groupMembers: [
                {
                    "concept": pulse,
                    "label": "Pulse",
                    "groupMembers": [],
                    "value": 72.6,
                    "voided": false
                },
                {
                    "concept": abnormal,
                    "label": "Abnormal",
                    "groupMembers": [],
                    "value": true,
                    "voided": false
                }
            ],
            "voided": false
        }];

        it ("should be a valid observation if value is integer and allow decimal is false and value is within absolute range", function () {
            pulse.allowDecimal = false;
            var observation = mapper.map(observations, pulseData, {});
            observation.primaryObs.value = 70;
            expect(observation.isValid()).toBeTruthy();
        });

        it ("should be a valid observation if value is integer and allow decimal is true and value is within absolute range", function () {
            pulse.allowDecimal = true;
            var observation = mapper.map(observations, pulseData, {});
            observation.primaryObs.value = 74;
            expect(observation.isValid()).toBeTruthy();
        });

        it ("should be a valid observation if value is decimal and allow decimal is true and value is within absolute range", function () {
            pulse.allowDecimal = true;
            var observation = mapper.map(observations, pulseData, {});
            observation.primaryObs.value = 74.6;
            expect(observation.isValid()).toBeTruthy();
        });

        it ("should be an invalid observation if value is decimal and allow decimal is false", function () {
            pulse.allowDecimal = false;
            var observation = mapper.map(observations, pulseData, {});
            observation.primaryObs.value = 74.6;
            expect(observation.isValid()).toBeFalsy();
        });


        it ("should be an invalid observation if value is integer and value is outside the absolute range", function () {
            pulse.allowDecimal = false;
            var observation = mapper.map(observations, pulseData, {});
            observation.primaryObs.value = 700;
            expect(observation.isValid()).toBeFalsy();
            expect(observation.primaryObs.erroneousValue).toBeTruthy();
        });



    });

    describe("observationNode", function () {

        it("should clone the  new observation", function () {
            var observation = mapper.map(savedObs, rootConcept, {"Chief Complaint Data": {autocomplete: true}});

            var clonedObservation = observation.cloneNew();

            expect(clonedObservation.concept.uuid).toBe(observation.concept.uuid);
            expect(clonedObservation.concept.name).toBe(observation.concept.name);
        });
        it("should set free text value", function () {
            var observation = mapper.map(savedObs, rootConcept, {"Chief Complaint Data": {autocomplete: true}});
            observation.value = "free text";

            expect(observation.value).toBe("free text");
        });
        it("should set the duration, abnormal and unknown obs",function(){
            var observation = mapper.map(savedObs, rootConcept, {"Chief Complaint Data": {autocomplete: true}});

            expect(observation.durationObs.value).toBe(30);
            expect(observation.abnormalObs.value).toBe(true);
            expect(observation.unknownObs.value).toBe(false);
        });

        it("should get the display value for coded concept",function(){
            var observation = mapper.map(savedObs, rootConcept, {"Chief Complaint Data": {autocomplete: true}});

            expect(observation.displayValue().name).toBe("Headache");
        });

        it("should update the observation with its first group member, if observation is not freetext autocomplete",function(){
            var observation = mapper.map(savedObs, rootConcept);

            expect(observation.primaryObs.concept.name).toBe("Chief Complaint");
        });
    });

    describe("validate ObservationNode",function () {

        it("should validate the required observations",function(){
            savedObs[0].groupMembers[0].value = undefined;
            var observation = mapper.map(savedObs, rootConcept, {"Chief Complaint Data": {autocomplete: true,required:true}});

            expect(observation.isValid(true,true)).toBeFalsy();

            savedObs[0].groupMembers[0].value = headache;
            expect(observation.isValid(true,true)).toBeTruthy();
        });

        it("should validate the free text auto complete",function () {
            var observation = mapper.map(savedObs, rootConcept, {"Chief Complaint Data": {autocomplete: true}});

            expect(observation.isValid(true,true)).toBeTruthy();
        });

        it("should validate the observation date field",function () {
            savedObs[0].groupMembers[0].concept.conceptClass.name = "Not computed";

            var observation = mapper.map(savedObs, rootConcept, {"Chief Complaint Data": {autocomplete: true}});
            observation.primaryObs.concept.dataType = "Date";
            observation.primaryObs.value = Bahmni.Common.Util.DateUtil.addDays(Bahmni.Common.Util.DateUtil.today(),2);

            expect(observation.isValid(false,true)).toBeFalsy();
        });

        it("should not throw exception if date field of type class computed",function(){
            var observation = mapper.map(savedObs, rootConcept, {"Chief Complaint Data": {autocomplete: true}});
            observation.primaryObs.concept.dataType = "Date";

            expect(observation.isValid(false,true)).toBeTruthy();
        });

        it("Should validate durationObs",function () {
            savedObs[0].groupMembers[1].value = -30;
            var observation = mapper.map(savedObs, rootConcept, {"Chief Complaint Data": {durationRequired:true}});

            expect(observation.isValid(false,true)).toBeFalsy();
        });

    });

    describe("Observation node config",function () {
        it("should text the comment config",function(){
            var observation = mapper.map(savedObs, rootConcept);

            expect(observation.canHaveComment()).toBeTruthy();

            observation = mapper.map(savedObs, rootConcept,{"Chief Complaint Data":{disableAddNotes:true}});
            expect(observation.canHaveComment()).toBeFalsy();

        });

        it("should test allow addmore configuration",function(){
            var observation = mapper.map(savedObs, rootConcept,{"Chief Complaint Data":{allowAddMore:true}});

            expect(observation.canAddMore()).toBeTruthy();

            observation = mapper.map(savedObs, rootConcept);
            expect(observation.canAddMore()).toBeFalsy();
        });

        it("should test stepper config for numeric observation",function(){
            var observation = mapper.map(savedObs, rootConcept,{"Chief Complaint Data":{stepper:true}});
            observation.primaryObs.concept.dataType = "Numeric";

            expect(observation.isStepperControl()).toBeTruthy();
            observation = mapper.map(savedObs, rootConcept);
            expect(observation.isStepperControl()).toBeFalsy();

        });
        it("should test conciseText config",function(){
            var observation = mapper.map(savedObs, rootConcept,{"Chief Complaint Data":{conciseText:true}});

            expect(observation.isConciseText()).toBeTruthy();
            observation = mapper.map(savedObs, rootConcept);

            expect(observation.isConciseText()).toBeFalsy();

        })

    });



    function buildConcept(name, setMembers, answers, classname, datatype) {
        return {
            "name": {name: name},
            "set": setMembers && setMembers.length > 0,
            conceptClass: {name: classname || "N/A"},
            datatype: {name: datatype || "Text"},
            setMembers: setMembers,
            answers: answers,
            "uuid": name + "_uuid"
        }
    }
});
