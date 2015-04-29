'use strict';

describe("Observation", function () {
    var MultiSelectObservation = Bahmni.Common.Obs.MultiSelectObservation;
    var ConceptSetMultiSelectObservations = Bahmni.ConceptSet.MultiSelectObservations;
    var ConceptSetMultiSelectObservation = Bahmni.ConceptSet.MultiSelectObservation;
    var conceptSetUI = {
        "Menstrual History": {
            "allowAddMore": true
        },
        "M/C Days" : {
            "multiSelect": true
        },
        "LMP": {
            "allowAddMore": true
        },
        "Tuberculosis" : {
            "multiSelect" : true,
            "required" : true
        }
    };

    describe("display Value", function () {

        it("should return comma separated values for observation type multiSelect", function () {
            var observation = new MultiSelectObservation([
                {"type": "Coded", "value": {"shortName": "Invasive Ductal Carcinoma", "name": "Invasive Ductal Carcinoma"}, "encounterDateTime": 1414486007000},
                {"type": "Coded", "value": {"shortName": "Invasive Lobular Carcinoma", "name": "Invasive Lobular Carcinoma"}, "encounterDateTime": 1414486007000}
            ], {});
            expect(observation.getDisplayValue()).toBe("Invasive Ductal Carcinoma, Invasive Lobular Carcinoma");
            expect(observation.encounterDateTime).toBe(1414486007000);
        });
    });

    describe("Concept Set MultiSelectObservations", function () {

        it("should test MultiSelectObservations", function () {
            var observation = new ConceptSetMultiSelectObservations(conceptSetUI);
            observation.map(groupMembers);
            expect(observation.multiSelectObservationsMap["M/C Days"].label).toBe("M/C Days");
            
        });
    });

    describe("Concept Set MultiSelectObservation", function () {

        it("should test MultiSelectObservation", function () {
            var observation = new ConceptSetMultiSelectObservation(groupMembers[0]["concept"],groupMembers,conceptSetUI);
            expect(observation.cloneNew().label).toBe("M/C Days");
            expect(observation.isFormElement()).toBe(true);
            expect(observation.getControlType()).toBe("buttonselect");
            expect(observation.atLeastOneValueSet()).toBe(false);
            expect(observation.canHaveComment()).toBe(false);
        });
    });

    describe("Concept Set MultiSelectObservation", function () {
        it("should test MultiSelectObservation has value", function () {
            var observation = observationFactory(groupMembers[3]["concept"],selectedObs);
            expect(observation.label).toBe("Tuberculosis");
            expect(observation.hasValue()).toBe(true);            
        });
        it("should test MultiSelectObservation has non voided value", function () {
            var observation = observationFactory(groupMembers[3]["concept"],selectedObs);
            expect(observation.label).toBe("Tuberculosis");
            expect(observation.hasNonVoidedValue()).toBe(false);
        });
        it("should test MultiSelectObservation is valid", function () {
           var observation = observationFactory(groupMembers[3]["concept"],selectedObs);
            expect(observation.label).toBe("Tuberculosis");
            expect(observation.isValid(true, true)).toBe(false);
            expect(observation.isValid(false, true)).toBe(true);
            expect(observation.atLeastOneValueSet()).toBe(false);
        });
    });

    var groupMembers = [ 
        {
            "concept": {
              "name": "M/C Days",
              "shortName": null,
              "conceptClass": "Misc",
              "answers": []
            },
            "label": "M/C Days",
            "possibleAnswers": [],
            "groupMembers": [],
            "isObservation": true,
            "uniqueId": "observation_55",
            "conceptUIConfig": {"multiSelect": true}
        },
        {
            "concept": {
              "name": "LMP",
              "shortName": null,
              "conceptClass": "Misc",
              "answers": []
            },
            "label": "LMP",
            "possibleAnswers": [],
            "groupMembers": [],
            "isObservation": true,
            "uniqueId": "observation_56",
            "conceptUIConfig": {"multiSelect": true}
        },
        {
            "concept": {
              "name": "Tuberculosis",
              "shortName": null,
              "conceptClass": "Any",
              "answers": []
            },
            "label": "Tuberculosis",
            "possibleAnswers": [],
            "groupMembers": [],
            "isObservation": true,
            "uniqueId": "observation_57",
            "conceptUIConfig": {"multiSelect": true, "required":true}
        }
    ],
    selectedObs = [
        {   
            "concept": {
              "name": "Sputum Culture Result",
              "shortName": null,
              "conceptClass": "Any",
              "answers": []
            },
            "possibleAnswers": [],
            "groupMembers": [],
            "isObservation": true,
            "uniqueId": "observation_58",
            "label": "Sputum Culture Result",
            "voided": true
        }
    ];

    function observationFactory(concept, obs) {
         var observation = new ConceptSetMultiSelectObservation(concept,groupMembers,conceptSetUI);
         observation.selectedObs = obs;
         return observation;
    }

});
