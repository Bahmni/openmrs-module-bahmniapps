'use strict';

describe("Specimen", function () {
    describe("Is Dirty", function () {
        it("Should return true if date collected is set and not type", function () {
            var specimen = new Bahmni.Clinical.Specimen();
            specimen.dateCollected = "Some Date";

            expect(specimen.isDirty()).toBe(true);
        });

        it("Should return true if date collected is not set and type is set", function () {
            var specimen = new Bahmni.Clinical.Specimen();
            specimen.type = "Some Type";

            expect(specimen.isDirty()).toBe(true);
        });

        it("Should return false if both date collected and type is set", function () {
            var specimen = new Bahmni.Clinical.Specimen();
            specimen.dateCollected = "Some Date";
            specimen.type = "Some Type";

            expect(specimen.isDirty()).toBe(false);
        });

        it("Should return false if both date collected and type is not set", function () {
            var specimen = new Bahmni.Clinical.Specimen();

            expect(specimen.isDirty()).toBe(false);
        });
    });

    describe("Is Empty", function () {
        it("Should return true if date collected, identifier, type are not set", function () {
            var specimen = new Bahmni.Clinical.Specimen();

            expect(specimen.isEmpty()).toBe(true);
        });

        it("Should return false if date collected is set and identifier and type are not", function () {
            var specimen = new Bahmni.Clinical.Specimen();
            specimen.dateCollected = "Some Date";

            expect(specimen.isEmpty()).toBe(false);
        });

        it("Should return false identifier is set and dateCollected and type are not", function () {
            var specimen = new Bahmni.Clinical.Specimen();
            specimen.identifier = "Some Identifier";

            expect(specimen.isEmpty()).toBe(false);
        });

        it("Should return false if type is set and dateCollected and identifier are not", function () {
            var specimen = new Bahmni.Clinical.Specimen();
            specimen.type = "Some Type";

            expect(specimen.isEmpty()).toBe(false);
        });

        it("Should return false if type, dateCollected and identifier are set", function () {
            var specimen = new Bahmni.Clinical.Specimen();
            specimen.type = "Some Type";
            specimen.dateCollected = "Some Date";
            specimen.identifier = "Some Identifier";

            expect(specimen.isEmpty()).toBe(false);
        });
    })

    describe("atLeastOneValueSet", function () {
        it("Should return false if result has no value", function () {
            var specimen = new Bahmni.Clinical.Specimen();

            expect(specimen.atLeastOneResult()).toBe(false);
        });

        it("Should return true if result has value", function () {
            var specimenData = {report: {results: [{value: "data"}]}}
            var specimen = new Bahmni.Clinical.Specimen(specimenData);

            expect(specimen.atLeastOneResult()).toBe(true);
        });
    });

    describe("isDateCollectedDirty", function () {
        it("Should return true if dateCollected has no value and hasIllegalDateCollected is true", function () {
            var specimen = new Bahmni.Clinical.Specimen();
            specimen.hasIllegalDateCollected = true;
            expect(specimen.isDateCollectedDirty()).toBe(true);
        });

        it("Should return true if dateCollected has value and hasIllegalDateCollected is false", function () {
            var specimen = new Bahmni.Clinical.Specimen();
            specimen.hasIllegalDateCollected = false;
            expect(specimen.isDateCollectedDirty()).toBe(false);
        });
    });

    describe("isTypeDirty", function () {
        it("Should return true if type has no value and hasIllegalType is true", function () {
            var specimen = new Bahmni.Clinical.Specimen();
            specimen.hasIllegalType = true;
            expect(specimen.isTypeDirty()).toBe(true);
        });

        it("Should return true if type has value and hasIllegalType is false", function () {
            var specimen = new Bahmni.Clinical.Specimen();
            specimen.hasIllegalType = false;
            expect(specimen.isTypeDirty()).toBe(false);
        });
    });

    describe("Dirty Rules for typeFreeText", function () {
        var specimen;

        beforeEach(function () {
            specimen = new Bahmni.Clinical.Specimen();
            specimen.dateCollected = "2016-01-13";
        });

        it("Should return true when typeFreeText is not set and specimen.type.name is Other", function () {
            specimen.type = {name: "Other"};
            expect(specimen.isDirty()).toBe(true);
        });

        it("Should return false when typeFreeText is set and specimen.type.name is Other", function () {
            specimen.type = {name: "Other"};
            specimen.typeFreeText = "Blood";
            expect(specimen.isDirty()).toBe(false);
        });

        it("Should return false when typeFree specimen.type.name is not Other and typeFreeText is not set", function () {
            specimen.type = {name: "Specimen, Urine"};
            expect(specimen.isDirty()).toBe(false);
        });
    });

    describe("Dirty Rules for Additional Attributes", function () {
        var specimen, sampleMock;
        beforeEach(function () {
            specimen = new Bahmni.Clinical.Specimen();
            sampleMock = {
                "additionalAttributes": [
                    {
                        "groupMembers": [
                            {
                                "value": "a"
                            },
                            {}
                        ]
                    }
                ]
            }
            specimen.sample = sampleMock
        });

        it("Should return true when additional attributes are filled", function () {
            expect(specimen.isAdditionalAttriburtesFilled()).toBe(true);
        });

        it("Should return true if date collected is not set, type is not set and additional attribute is set", function () {
            expect(specimen.isDirty()).toBe(true);
        });
    });

    describe("Empty existing specimen should be voided", function () {
        var specimen = new Bahmni.Clinical.Specimen();
        specimen.type = undefined;
        specimen.dateCollected = undefined;
        specimen.identifier = undefined;
        specimen.uuid = "some uuid";
        specimen.typeObservation = {type : "Some Type", dateCollected : "Some date"};
        specimen.sample = {
            "additionalAttributes": [
                {
                    "groupMembers": [
                        {
                            "value": "a"
                        }
                    ]
                }
            ]
        };
        specimen.report = {
            "results": [
                {
                    "groupMembers": [
                        {
                            "value": "a"
                        }
                    ]
                }
            ]

        };
        specimen.voidIfEmpty();
        it("Specimen should be cleared and voided on save with mandatory attributes", function () {
            expect(specimen.dateCollected).toEqual("Some date");
            expect(specimen.type).toEqual("Some Type");
            expect(specimen.typeFreeText).toBeUndefined();
            expect(specimen.identifier).toBeUndefined();
            expect(specimen.sample.additionalAttributes[0].groupMembers[0].value).toBeUndefined();
            expect(specimen.report.results[0].groupMembers[0].value).toBeUndefined();
        });

        it("Specimen should be voided ony if it is empty and existing", function () {
            specimen.uuid = null;
            expect(specimen.voidIfEmpty()).toBeFalsy();

        });
    });
});
