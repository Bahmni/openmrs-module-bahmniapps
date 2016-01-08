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
            var specimenData = { report :{results:[{value:"data"}]}}
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
});