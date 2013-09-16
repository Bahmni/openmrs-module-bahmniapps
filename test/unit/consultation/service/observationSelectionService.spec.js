'use strict';

describe("observationSelectionService", function () {
    beforeEach(module('opd.consultation.services'));

    it('should add observation if not already added', inject(['observationSelectionService', function (observationSelectionService) {
        var observation1 = {concept:{conceptName: "name1"}};
        var observation2 = {concept:{conceptName: "name2"}};

        observationSelectionService.addObservation(observation1);
        expect(observationSelectionService.getSelectedObservations()).toContain(observation1);
        expect(observationSelectionService.getSelectedObservations().length).toBe(1);

        observationSelectionService.addObservation(observation1);
        expect(observationSelectionService.getSelectedObservations().length).toBe(1);

        observationSelectionService.addObservation(observation2);
        expect(observationSelectionService.getSelectedObservations().length).toBe(2);
        expect(observationSelectionService.getSelectedObservations()).toContain(observation2);
    }]));

    it('should remove observation if added', inject(['observationSelectionService', function (observationSelectionService) {
        var observation1 = {concept:{conceptName: "name1"}};
        var observation2 = {concept:{conceptName: "name2"}};

        observationSelectionService.addObservation(observation1);
        observationSelectionService.addObservation(observation2);
        expect(observationSelectionService.getSelectedObservations().length).toBe(2);

        observationSelectionService.remove(observation2);
        expect(observationSelectionService.getSelectedObservations().length).toBe(1);
        expect(observationSelectionService.getSelectedObservations()).toContain(observation1);
        expect(observationSelectionService.getSelectedObservations()).not.toContain(observation2);
    }]));
});
