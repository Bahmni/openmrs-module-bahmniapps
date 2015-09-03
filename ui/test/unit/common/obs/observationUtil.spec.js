'use strict';

describe("ObservationUtil", function () {
    var ObservationUtil = Bahmni.Common.Obs.ObservationUtil;

    describe("should map observation", function () {
        it("should map observations with similar concepts in sorted order of observationDateTime", function () {
            var bahmniObservations = [
                {
                    "value": 1,
                    "concept": {
                        "shortName": null,
                        "name": "Other",
                        "set": true,
                        "units": null,
                        "conceptClass": "Misc",
                        "dataType": "N/A"
                    },
                    "conceptUuid": "otherUuid",
                    "observationDateTime": "2014-10-21T11:30:47.000+0530"
                },
                {
                    "value": 2,
                    "concept": {
                        "shortName": null,
                        "name": "SameOne",
                        "set": true,
                        "units": null,
                        "conceptClass": "Misc",
                        "dataType": "N/A"
                    },
                    "conceptUuid": "sameUuid",
                    "observationDateTime": "2014-10-21T11:30:47.000+0530"
                },
                {
                    "value": 3,
                    "concept": {
                        "shortName": null,
                        "name": "SameOne",
                        "set": true,
                        "units": null,
                        "conceptClass": "Misc",
                        "dataType": "N/A"
                    },
                    "conceptUuid": "sameUuid",
                    "observationDateTime": "2014-10-20T11:30:47.000+0530"
                },
                {
                    "value": 4,
                    "concept": {
                        "shortName": null,
                        "name": "SameOther",
                        "set": true,
                        "units": null,
                        "conceptClass": "Misc",
                        "dataType": "N/A"
                    },
                    "conceptUuid": "otherOneUuid",
                    "observationDateTime": "2014-10-20T11:30:49.000+0530"
                },
                {
                    "value": 5,
                    "concept": {
                        "shortName": null,
                        "name": "SameOther",
                        "set": true,
                        "units": null,
                        "conceptClass": "Misc",
                        "dataType": "N/A"
                    },
                    "conceptUuid": "otherOneUuid",
                    "observationDateTime": "2014-10-20T11:30:47.000+0530"
                }
            ];

            var mappedObservation = ObservationUtil.sortSameConceptsWithObsDateTime(bahmniObservations);
            expect(mappedObservation.length).toBe(5);
            expect(mappedObservation[0].value).toBe(1);
            expect(mappedObservation[1].value).toBe(3);
            expect(mappedObservation[2].value).toBe(2);
            expect(mappedObservation[3].value).toBe(5);
            expect(mappedObservation[4].value).toBe(4);
        })
    });

    describe("flatten", function () {
        it("should flatten the observation", function () {
            var observation = {
                groupMembers: [
                    {concept: {name: "concept1"}, value: "1"},
                    {
                        groupMembers: [
                            {concept: {name: "concept2"}, value: "2"},
                            {concept: {name: "concept3"}, value: "3"},
                        ]
                    }
                ]
            };
            var flattenedObservations = Bahmni.Common.Obs.ObservationUtil.flatten(observation);

            expect(flattenedObservations).toEqual({
                "concept1": '1',
                "concept2": '2',
                "concept3": '3'
            });
        });

        it("should return the same if the passed object is a leaf observation", function () {
            var observation = {concept: {name: "concept1"}, value: "1"};
            var flattenedObservation = Bahmni.Common.Obs.ObservationUtil.flatten(observation);
            expect(flattenedObservation).toEqual({
                "concept1": '1'
            });
        });
    })

});