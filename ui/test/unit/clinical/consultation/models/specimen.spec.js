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
});