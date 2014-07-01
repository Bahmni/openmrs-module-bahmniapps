'use strict';

describe("AccessionNotesMapper", function () {

    describe("accessionNotesMapperTest", function () {
        var mapper;
        var _encounterConfig = new EncounterConfig();
        beforeEach(function () {
            _encounterConfig = jasmine.createSpyObj('EncounterConfig', ['getValidationEncounterTypeUuid']);
            _encounterConfig.getValidationEncounterTypeUuid.and.returnValue("pass");
            mapper = new Bahmni.Clinical.AccessionNotesMapper(_encounterConfig);
        });

        it('Should add accessionNotes to the accessions if there are accessionNotes in the encounter of type accessionNotes', function () {
            var accessions = [
                {
                    accessionUuid: "1"
                }
            ];

            var encounters = [
                {
                    encounterTypeUuid: "pass",
                    accessionNotes: {
                        accessionUuid: "1"
                    }
                },
                {
                    encounterTypeUuid: "fail"
                }

            ];
            var resultantAccessions = mapper.map(encounters, accessions);
            expect(resultantAccessions[0].accessionNotes.length).toBe(1);
        });
        it('Should not add accessionNotes to the accessions if there are accessionNotes in the encounter of some other type', function () {
            var accessions = [
                {
                    accessionUuid: "1",
                    accessionNotes: []
                }
            ];

            var encounters = [
                {
                    encounterTypeUuid: "fail",
                    accessionNotes: {
                        accessionUuid: "1"
                    }
                },
                {
                    encounterTypeUuid: "fail"
                }

            ];
            var resultantAccessions = mapper.map(encounters, accessions);
            expect(resultantAccessions[0].accessionNotes.length).toBe(0);
        });

        it('Should not add accessionNotes to the accessions if there are no accessionNotes in the encounter of type accessionNotes', function () {
            var accessions = [
                {
                    accessionUuid: "1",
                    accessionNotes: []
                }
            ];

            var encounters = [
                {
                    encounterTypeUuid: "fail",
                    accessionNotes: []
                },
                {
                    encounterTypeUuid: "fail"
                }

            ];
            var resultantAccessions = mapper.map(encounters, accessions);
            expect(resultantAccessions[0].accessionNotes.length).toBe(0);
        });



        it('Should not add accessionNotes by datetime attribute', function () {
            var accessions = [
                {
                    accessionUuid: "1",
                    accessionNotes: []
                }
            ];

            var encounters = [
                {
                    encounterTypeUuid: "pass",
                    accessionNotes: [
                        {
                            accessionUuid: "1",
                            dateTime: 1
                        },
                        {
                            accessionUuid: "1",
                            dateTime: 2
                        },
                        {
                            accessionUuid: "1",
                            dateTime: 3
                        }
                    ]
                },
                {
                    encounterTypeUuid: "fail"
                }

            ];
            var resultantAccessions = mapper.map(encounters, accessions);
            expect(resultantAccessions[0].accessionNotes.length).toBe(3);
            expect(resultantAccessions[0].accessionNotes[0].dateTime).toBe(1);
            expect(resultantAccessions[0].accessionNotes[1].dateTime).toBe(2);
            expect(resultantAccessions[0].accessionNotes[2].dateTime).toBe(3);
        });
    });
});

