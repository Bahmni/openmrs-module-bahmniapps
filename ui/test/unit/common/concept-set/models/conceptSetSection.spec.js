'use strict';

describe("ConceptSetSection", function () {

    var ConceptSetSection = Bahmni.ConceptSet.ConceptSetSection;

    var conceptSet = {
        name: {name: "vitals"},
        names: [
            {name: "vitals", conceptNameType: "SHORT"}
        ]
    };

    describe("isAvailable", function () {
        it("should be true if 'showIf' condition is not defined", function () {
            expect(new ConceptSetSection({extensionParams: {conceptName: "vitals"}}, new Bahmni.Auth.User({}), {}, [], conceptSet).isAvailable()).toBe(true);
            expect(new ConceptSetSection({
                extensionParams: {
                    conceptName: "vitals",
                    showIf: null
                }
            }, new Bahmni.Auth.User({}), {}, [], conceptSet).isAvailable()).toBe(true);
        });

        it("should be false if 'showIf' condition returns false", function () {
            var conceptSetSection = new ConceptSetSection({
                extensionParams: {
                    conceptName: "vitals",
                    showIf: ["return false;"]
                }
            }, new Bahmni.Auth.User({}), {}, [], conceptSet);

            expect(conceptSetSection.isAvailable()).toBe(false);
        });

        it("should be true if 'showIf' condition returns true", function () {
            var conceptSetSection = new ConceptSetSection({
                extensionParams: {
                    conceptName: "vitals",
                    showIf: ["return true;"]
                }
            }, new Bahmni.Auth.User({}), {}, [], conceptSet);

            expect(conceptSetSection.isAvailable()).toBe(true);
        });

        it("should pass the context to the showIf function", function () {
            var context = {visitTypeName: 'OPD', patient: {gender: 'M'}};
            var extensionParams =
            {
                extensionParams: {
                    showIf: ["if(context.visitTypeName === 'OPD' && context.patient.gender === 'M')",
                        "return true;",
                        "else",
                        "return false;"
                    ],
                    conceptName: "vitals"
                }
            };
            var conceptSetSection = new ConceptSetSection(extensionParams, new Bahmni.Auth.User({}), {}, [], conceptSet);

            expect(conceptSetSection.isAvailable(context)).toBe(true);
        });
    });

    var config =
    {
        extensionParams: {
            default: true,
            conceptName: "vitals"
        }
    };

    var noDefaultConfig =
    {
        extensionParams: {
            conceptName: "vitals",
            "section": {
                "title": "Vitals",
                "name": "vitals",
                "isObservation": true,
                "dashboardConfig": {
                    "conceptNames": ["Vitals", "Second Vitals"],
                    "numberOfVisits": 2
                },
                "expandedViewConfig": {
                    "conceptNames": ["Height", "Weight", "BMI", "BMI STATUS"],
                    "numberOfVisits": 2,
                    "pivotTable": {
                        "numberOfVisits": "4",
                        "groupBy": "encounters",
                        "obsConcepts": ["Height", "Weight", "BMI", "BMI STATUS"],
                        "drugConcepts": "",
                        "labConcepts": ""
                    }
                }
            }
        }
    };
    describe("isAdded", function () {

        it("should be true if concept set is configured to be default", function () {
            var conceptSetSection = new ConceptSetSection(config, new Bahmni.Auth.User({}), {}, [], conceptSet);
            expect(conceptSetSection.isAdded).toBe(true);
        });

        it("should be true if concept set observation has at least one value set, even if its not default", function () {
            var observations = [
                {concept: {name: "vitals"}, value: "12"},
                {concept: {name: "second vitals"}, value: ""}
            ];
            var conceptSetSection = new ConceptSetSection(noDefaultConfig, new Bahmni.Auth.User({}), {}, observations, conceptSet);
            expect(conceptSetSection.isAdded).toBe(true);
        });

        it("should be false if concept set observation has value set to an empty string", function () {
            var observations = [
                {concept: {name: "vitals"}, value: ""}
            ];
            var conceptSetSection = new ConceptSetSection(noDefaultConfig, new Bahmni.Auth.User({}), {}, observations, conceptSet);
            expect(conceptSetSection.isAdded).toBe(false);
        });

        it("should be false if concept set has no observations", function () {
            var observations = [
                {concept: {name: "vitals"}, value: ""}
            ];
            var conceptSetSection = new ConceptSetSection(noDefaultConfig, new Bahmni.Auth.User({}), {}, observations, conceptSet);
            expect(conceptSetSection.isAdded).toBe(false);
        });
    });

    describe("isOpen", function () {
        it("should be true if conceptSet observations has value", function () {
            var observations = [
                {concept: {name: "vitals"}, value: "12"},
                {concept: {name: "second vitals"}, value: ""}
            ];
            var conceptSetSection = new ConceptSetSection(noDefaultConfig, new Bahmni.Auth.User({}), {}, observations, conceptSet);
            expect(conceptSetSection.isOpen).toBe(true);
        })
    });

    describe("canToggle", function () {
        var extensions =
        {
            extensionParams: {
                default: true,
                conceptName: "vitals"
            }
        };

        it("should return false if conceptSet observations has value", function () {
            var observations = [
                {concept: {name: "vitals"}, value: "12"},
                {concept: {name: "second vitals"}, value: ""}
            ];
            var conceptSetSection = new ConceptSetSection(noDefaultConfig, new Bahmni.Auth.User({}), {}, observations, conceptSet);
            expect(conceptSetSection.canToggle()).toBe(false);
        });

        it("should return true if conceptSet observations has no value", function () {
            var observations = [
                {concept: {name: "vitals"}, value: ""}
            ];
            var conceptSetSection = new ConceptSetSection(extensions, new Bahmni.Auth.User({}), {}, observations, conceptSet);
            expect(conceptSetSection.canToggle()).toBe(true);
        });

        it("should return true if conceptSet observations has value 0", function () {
            var observations = [
                {concept: {name: "vitals"}, value: 0}
            ];
            var conceptSetSection = new ConceptSetSection(extensions, new Bahmni.Auth.User({}), {}, observations, conceptSet);
            expect(conceptSetSection.canToggle()).toBe(false);
        });

    });

    describe("toggleDisplay", function () {
        var config =
        {
            extensionParams: {
                default: true,
                conceptName: "vitals"
            }
        };

        it("should hide if open", function () {
            var conceptSetSection = new ConceptSetSection(config, new Bahmni.Auth.User({}), {}, [], conceptSet);
            conceptSetSection.show();
            expect(conceptSetSection.isOpen).toBe(true);
            conceptSetSection.toggleDisplay();
            expect(conceptSetSection.isOpen).toBe(false);
        });

        it("should show if hidden", function () {
            var conceptSetSection = new ConceptSetSection(config, new Bahmni.Auth.User({}), {}, [], conceptSet);
            expect(conceptSetSection.isOpen).toBe(false);
            conceptSetSection.toggleDisplay();
            expect(conceptSetSection.isOpen).toBe(true);
        });

    });

    describe("clone", function () {
        it("should clone the concept set section and set isAdded to true", function () {
            var extensions = {extensionParams: {conceptName: "vitals"}};
            var conceptSetSection = new ConceptSetSection(extensions, new Bahmni.Auth.User({}), {}, [], conceptSet);
            var clonedConceptSetSection = conceptSetSection.clone();

            expect(clonedConceptSetSection).toBeTruthy();
            expect(clonedConceptSetSection.isAdded).toBeTruthy();
        });
    });
});
