'use strict';

describe("SpecimenMapper", function () {
    var specimenMapper = new Bahmni.Clinical.SpecimenMapper();

    describe("mapObservationToSpecimen", function () {
        it("should map observation to specimen object", function () {
            var observationData = {
                identifier: "138",
                uuid: "1647da59-ef2f-483c-aa11-62ce876b3fb7",
                existingObs: "1647da59-ef2f-483c-aa11-62ce876b3fb7",
                type: {name: "blood"},
                dateCollected: "30-11-2015",
                report: {
                    results: [{
                        concept: {name: "Bacteriology Results", shortName: "Results"},
                        groupMembers: [{
                            concept: {
                                name: "HTC result",
                                shortName: "Test Results"
                            },
                            value: {name: "Positive"}
                        }],
                        value: "Positive"
                    }]
                }
            };

            var specimen = specimenMapper.mapObservationToSpecimen(observationData, undefined, {});
            expect(specimen.specimenId).toBe(observationData.identifier);
            expect(specimen.specimenSource).toBe(observationData.type.name);
            expect(specimen.specimenCollectionDate).toBe(specimen.dateCollected);
            expect(specimen.sampleResult.concept).toBe(specimen.report.results[0].concept);
            expect(specimen.sampleResult.groupMembers.length).toBe(specimen.report.results[0].groupMembers.length);
        });
    });

    describe("mapSpecimenToObservation", function () {
        it("should map specimen to observation object", function () {
            var specimenData = {
                identifier: "138",
                uuid: "1647da59-ef2f-483c-aa11-62ce876b3fb7",
                existingObs: "1647da59-ef2f-483c-aa11-62ce876b3fb7",
                type: {name: "blood"},
                dateCollected: "30-11-2015",
                typeObservation: {},
                specimenId: "138",
                specimenSource: "blood",
                specimenCollectionDate: "30-11-2015",
                sample: {additionalAttributes: []},
                report: {results: []}
            };

            var specimen = specimenMapper.mapSpecimenToObservation(specimenData);
            expect(specimen.specimenId).toBe(undefined);
            expect(specimen.specimenSource).toBe(undefined);
            expect(specimen.specimenCollectionDate).toBe(undefined);
        });
    });

});