'use strict';

describe("Visit ", function () {
    var buildConcept = Bahmni.Tests.conceptMother.build;
    var buildObs = Bahmni.Tests.observationMother.build;
    var encounterConfig = jasmine.createSpyObj('encounterConfig', ['getRadiologyEncounterTypeUuid', 'getPatientDocumentEncounterTypeUuid']);
    encounterConfig.getRadiologyEncounterTypeUuid.and.returnValue("Some");
    encounterConfig.getPatientDocumentEncounterTypeUuid.and.returnValue("Some");

    describe("getImageObservations ", function () {
        it('should filter observations of class Image', function () {
            var obs1 = buildObs({concept: buildConcept({conceptClass: 'Image'})});
            var obs2 = buildObs({concept: buildConcept({conceptClass: 'Misc'})});
            var obs3 = buildObs({concept: buildConcept({conceptClass: 'Image'})});
            var observations = [obs1, obs2, obs3];
            var visit = new Bahmni.Clinical.Visit([], [], [], observations, [], encounterConfig, [], {}, null, null);

            var imageObservations = visit.getImageObservations();

            expect(imageObservations.length).toBe(2);
            expect(imageObservations[0]).toBe(obs1);
            expect(imageObservations[1]).toBe(obs3);
        });

        it('should get group members of the observations with Image class', function () {
            var obs11 = buildObs({concept: buildConcept({conceptClass: 'Image'})});
            var obs12 = buildObs({concept: buildConcept({conceptClass: 'Misc'})});
            var obs1 = buildObs({groupMembers: [obs11, obs12], concept: buildConcept({conceptClass: 'ConvSet'})});
            var obs2 = buildObs({concept: buildConcept({conceptClass: 'Misc'})});
            var obs3 = buildObs({concept: buildConcept({conceptClass: 'Image'})});
            var observations = [obs1, obs2, obs3];
            var visit = new Bahmni.Clinical.Visit([], [], [], observations, [], encounterConfig, [], {}, null, null);

            var imageObservations = visit.getImageObservations();

            expect(imageObservations.length).toBe(2);
            expect(imageObservations[0]).toBe(obs11);
            expect(imageObservations[1]).toBe(obs3);
        });
    });
})