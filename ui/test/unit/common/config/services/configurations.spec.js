'use strict';

describe("configurations", function () {
    var configurations, configurationService;

    var configurationServiceResponse = {
        dosageInstructionConfig: { results: [{}] },
        stoppedOrderReasonConfig: { results: [{}] },
        relationshipTypeMap : { type1 : 'desc1', type2 : 'desc2' }
    };

    beforeEach(module('bahmni.common.config'));

    beforeEach(module(function ($provide) {
        configurationService = jasmine.createSpyObj('configurationService', ['getConfigurations']);
        configurationService.getConfigurations.and.callFake(function() {
            return specUtil.respondWith(configurationServiceResponse);
        });
        $provide.value('configurationService', configurationService);
    }));

    beforeEach(inject(['configurations', function (configurationsInjected) {
        configurations = configurationsInjected;
    }]));

    it('should load configurations', function() {
        var configNames = ['dosageInstructionConfig', 'stoppedOrderReasonConfig'];
        configurations.load(configNames);
        expect(configurationService.getConfigurations).toHaveBeenCalledWith(configNames);
        configurations.load(configNames).then(function() {
            done();
        });
    });

    it('should return dosageInstructionConfig', function() {
        configurations.configs.dosageInstructionConfig = ['dosage1', 'dosage2'];
        expect(configurations.dosageInstructionConfig()).toEqual(['dosage1', 'dosage2']);
    });

    it('should return empty array if dosageInstructionConfig not present', function() {
        expect(configurations.dosageInstructionConfig()).toEqual([]);
    });

    it('should return stoppedOrderReasonConfig', function() {
        configurations.configs.stoppedOrderReasonConfig = ['reason1', 'reason2'];
        expect(configurations.stoppedOrderReasonConfig()).toEqual(['reason1', 'reason2']);
    });

    it('should return empty array if stoppedOrderReasonConfig not present', function() {
        expect(configurations.stoppedOrderReasonConfig()).toEqual([]);
    });

    it('should return dosageFrequencyConfig', function() {
        configurations.configs.dosageFrequencyConfig = ['frequency1', 'frequency2'];
        expect(configurations.dosageFrequencyConfig()).toEqual(['frequency1', 'frequency2']);
    });

    it('should return empty array if dosageFrequencyConfig not present', function() {
        expect(configurations.dosageFrequencyConfig()).toEqual([]);
    });

    it('should return allTestsAndPanelsConcept', function() {
        configurations.configs.allTestsAndPanelsConcept = { results: ['test1', 'test2'] };
        expect(configurations.allTestsAndPanelsConcept()).toEqual('test1');
    });

    it('should return empty array if allTestsAndPanelsConcept not present', function() {
        expect(configurations.allTestsAndPanelsConcept()).toEqual([]);
    });

    it('should return impressionConcept', function() {
        configurations.configs.radiologyImpressionConfig = { results: ['impression1', 'impression2'] };
        expect(configurations.impressionConcept()).toEqual('impression1');
    });

    it('should return empty array if impressionConcept not present', function() {
        expect(configurations.impressionConcept()).toEqual([]);
    });

    it('should return labOrderNotesConcept', function() {
        configurations.configs.labOrderNotesConfig = { results: ['note1', 'note2'] };
        expect(configurations.labOrderNotesConcept()).toEqual('note1');
    });

    it('should return empty array if labOrderNotesConfig not present', function() {
        expect(configurations.labOrderNotesConcept()).toEqual([]);
    });

    it('should return consultationNoteConcept', function() {
        configurations.configs.consultationNoteConfig = { results: ['note1', 'note2'] };
        expect(configurations.consultationNoteConcept()).toEqual('note1');
    });

    it('should return empty array if consultationNoteConcept not present', function() {
        expect(configurations.consultationNoteConcept()).toEqual([]);
    });

    it('should return patientConfig', function() {
        configurations.configs.patientConfig = { key: 'value' };
        expect(configurations.patientConfig()).toEqual({ key: 'value' });
    });

    it('should return empty array if patientConfig not present', function() {
        expect(configurations.patientConfig()).toEqual({});
    });

    it('should return encounterConfig', function() {
        configurations.configs.encounterConfig = { key: 'value' };
        expect(configurations.encounterConfig()).toEqual(jasmine.objectContaining({ key: 'value' }));
    });

    it('should return empty array if encounterConfig not present', function() {
        expect(configurations.encounterConfig()).toEqual(jasmine.objectContaining({ encounterTypes : undefined }));
    });

    it('should return patientAttributesConfig', function() {
        configurations.configs.patientAttributesConfig = { results: ['attribute1', 'attribute2'] };
        expect(configurations.patientAttributesConfig()).toEqual(['attribute1', 'attribute2']);
    });

    it('should return identifierTypesConfig', function() {
        configurations.configs.identifierTypesConfig = ['type1', 'type2'];
        expect(configurations.identifierTypesConfig()).toEqual(['type1', 'type2']);
    });

    it('should return genderMap', function() {
        configurations.configs.genderMap = { M: 'Male', F: 'Female' };
        expect(configurations.genderMap()).toEqual({ M: 'Male', F: 'Female' });
    });

    it('should return addressLevels', function() {
        configurations.configs.addressLevels = ['level1', 'level2'];
        expect(configurations.addressLevels()).toEqual(['level1', 'level2']);
    });

    it('should return relationshipTypes', function() {
        configurations.configs.relationshipTypeConfig = { results: ['type1', 'type2'] };
        expect(configurations.relationshipTypes()).toEqual(['type1', 'type2']);
    });

    it('should return empty array if relationshipTypes not present', function() {
        expect(configurations.relationshipTypes()).toEqual([]);
    });

    it('should return relationshipTypeMap', function() {
        configurations.configs.relationshipTypeMap = { type1: 'desc1', type2: 'desc2' };
        expect(configurations.relationshipTypeMap()).toEqual({ type1: 'desc1', type2: 'desc2' });
    });

    it('should return empty array if relationshipTypeMap not present', function() {
        expect(configurations.relationshipTypeMap()).toEqual({});
    });

    it('should return loginLocationToVisitTypeMapping', function() {
        configurations.configs.loginLocationToVisitTypeMapping = { location1: 'visitType1' };
        expect(configurations.loginLocationToVisitTypeMapping()).toEqual({ location1: 'visitType1' });
    });
    
    it('should return empty array if loginLocationToVisitTypeMapping not present', function() {
        expect(configurations.loginLocationToVisitTypeMapping()).toEqual({});
    });

    it('should return defaultEncounterType', function() {
        configurations.configs.defaultEncounterType = 'encounterType1';
        expect(configurations.defaultEncounterType()).toEqual('encounterType1');
    });

    it('should return helpDeskNumber', function() {
        configurations.configs.helpDeskNumber = '1234567890';
        expect(configurations.helpDeskNumber()).toEqual('1234567890');
    });

    it('should return prescriptionEmailToggle', function() {
        configurations.configs.prescriptionEmailToggle = true;
        expect(configurations.prescriptionEmailToggle()).toBe(true);
    });

});