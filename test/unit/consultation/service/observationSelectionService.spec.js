'use strict';

describe("observationSelectionService", function () {
    beforeEach(module('opd.consultation.services'));
    var Diagnosis = Bahmni.Opd.Consultation.Diagnosis;

    it('should add observation if not already added', inject(['observationSelectionService', function (observationSelectionService) {
        var concept1 = {conceptName: "name1"};
        var concept2 = {conceptName: "name2"};

        observationSelectionService.addDiagnosis(concept1);
        expect(observationSelectionService.getSelectedObservations().length).toBe(1);
        expect(observationSelectionService.getSelectedObservations()[0].concept).toBe(concept1);

        observationSelectionService.addDiagnosis(concept1);
        expect(observationSelectionService.getSelectedObservations().length).toBe(1);

        observationSelectionService.addDiagnosis(concept2);
        expect(observationSelectionService.getSelectedObservations().length).toBe(2);
        expect(observationSelectionService.getSelectedObservations()[1].concept).toBe(concept2);
    }]));

    it('should remove observation if added', inject(['observationSelectionService', function (observationSelectionService) {
        var concept1 = {conceptName: "name1"};
        var concept2 = {conceptName: "name2"};

        observationSelectionService.addDiagnosis(concept1);
        observationSelectionService.addDiagnosis(concept2);
        expect(observationSelectionService.getSelectedObservations().length).toBe(2);

        var addedDiagnosis = observationSelectionService.getSelectedObservations()[1]

        observationSelectionService.remove(addedDiagnosis);
        expect(observationSelectionService.getSelectedObservations().length).toBe(1);
        expect(observationSelectionService.getSelectedObservations()[0].concept).toBe(concept1);
    }]));
});
