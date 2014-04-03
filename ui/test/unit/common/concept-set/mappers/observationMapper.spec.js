'use strict';

describe("ObservationMapper", function () {
    var conceptSet, conceptSetUIConfig, compoundObservationConcept, observationMapper;
    
    beforeEach(function() {
        conceptSet = 
            build({name: "VITALS_CONCEPT", set: true,
                setMembers : [
                    build({name: "Pulse"}),
                    build({name: "BP", set: true, setMembers: [build({name: "Systolic"}), build({name: "Diastolic"})]}),
                    build({name: "Sugar"})
                ]});

        conceptSetUIConfig = {
            "Pulse": {},
            "Systolic": {showAbnormalIndicator: true},
            "Diastolic": {showAbnormalIndicator: false}
        };

        compoundObservationConcept = build({name: "XCompoundObservation", set: true, setMembers: [ build({name: "IS_ABNORMAL"})]});

        observationMapper = new Bahmni.ConceptSet.ObservationMapper(conceptSetUIConfig, compoundObservationConcept);
    });

    it('should map new observations with given concept set and ui config', function () {
        var existingObservations = [];

        var rootNode = observationMapper.map(existingObservations, conceptSet);

        expect(rootNode.compoundObservation.concept.name).toBe('XCompoundObservation');
        expect(rootNode.primaryObservation.concept.name).toBe('VITALS_CONCEPT');
        expect(rootNode.abnormalityObservation).toBeDefined();
        expect(rootNode.children.length).toBe(3);
        expect(rootNode.primaryObservation.groupMembers.length).toBe(3);
        expect(rootNode.primaryObservation.groupMembers[0].concept.name).toBe('XCompoundObservation');
        expect(rootNode.primaryObservation.groupMembers[0].groupMembers[0].concept.name).toBe('Pulse');
        expect(rootNode.primaryObservation.groupMembers[0].groupMembers[1].concept.name).toBe('IS_ABNORMAL');
        expect(rootNode.primaryObservation.groupMembers[1].concept.name).toBe('XCompoundObservation');
        expect(rootNode.primaryObservation.groupMembers[1].groupMembers[0].concept.name).toBe('BP');
        expect(rootNode.primaryObservation.groupMembers[1].groupMembers[0].groupMembers[0].concept.name).toBe('XCompoundObservation');
        expect(rootNode.primaryObservation.groupMembers[1].groupMembers[0].groupMembers[0].groupMembers[0].concept.name).toBe('Systolic');
        expect(rootNode.primaryObservation.groupMembers[1].groupMembers[0].groupMembers[0].groupMembers[1].concept.name).toBe('IS_ABNORMAL');
        expect(rootNode.primaryObservation.groupMembers[1].groupMembers[0].groupMembers[1].concept.name).toBe('XCompoundObservation');
        expect(rootNode.primaryObservation.groupMembers[1].groupMembers[0].groupMembers[1].groupMembers[0].concept.name).toBe('Diastolic');
        expect(rootNode.primaryObservation.groupMembers[1].groupMembers[0].groupMembers[1].groupMembers[1].concept.name).toBe('IS_ABNORMAL');
        expect(rootNode.primaryObservation.groupMembers[1].groupMembers[1].concept.name).toBe('IS_ABNORMAL');
        expect(rootNode.primaryObservation.groupMembers[2].concept.name).toBe('XCompoundObservation');
        expect(rootNode.primaryObservation.groupMembers[2].groupMembers[0].concept.name).toBe('Sugar');
        expect(rootNode.primaryObservation.groupMembers[2].groupMembers[1].concept.name).toBe('IS_ABNORMAL');
        var nodeForBP = rootNode.children[1];
        expect(nodeForBP.compoundObservation.concept.name).toBe('XCompoundObservation');
        expect(nodeForBP.primaryObservation.concept.name).toBe('BP');
        expect(nodeForBP.children.length).toBe(2);
        expect(nodeForBP.primaryObservation.groupMembers.length).toBe(2);
        expect(nodeForBP.children[0].primaryObservation.concept.name).toBe('Systolic');
        expect(nodeForBP.children[0].showAbnormalIndicator).toBe(true);
        expect(nodeForBP.children[1].primaryObservation.concept.name).toBe('Diastolic');
        expect(nodeForBP.children[1].showAbnormalIndicator).toBe(false);
    });


    it('should map existing observations with given concept set and ui config', function () {
        var systolic = buildObservation({concept: getConcept("Systolic"), value: 10});
        var diastolic = buildObservation({concept: getConcept("Diastolic"), value: 20});
        var bp = buildObservation({concept: getConcept("BP"), groupMembers: [buildCompundObservation(systolic, false), buildCompundObservation(diastolic)]});
        var pulse = buildObservation({concept: getConcept("Pulse"), value: 30});
        var vitals = buildObservation({concept:  getConcept("VITALS_CONCEPT"), groupMembers: [buildCompundObservation(pulse, true), buildCompundObservation(bp)]});
        var existingObservations = [buildCompundObservation(vitals)];

        var rootNode = observationMapper.map(existingObservations, conceptSet);

        expect(rootNode.compoundObservation.concept.name).toBe('XCompoundObservation');
        expect(rootNode.primaryObservation).toBe(vitals);
        expect(rootNode.abnormalityObservation).toBeDefined();
        expect(rootNode.children.length).toBe(3);
        var nodeForPulse = rootNode.children[0];
        expect(nodeForPulse.primaryObservation).toBe(pulse);
        expect(nodeForPulse.abnormalityObservation.value).toBe(true);
        var nodeForBP = rootNode.children[1];
        expect(nodeForBP.primaryObservation).toBe(bp);
        expect(nodeForBP.children.length).toBe(2);
        expect(nodeForBP.children[0].primaryObservation.concept.name).toBe('Systolic');
        expect(nodeForBP.children[0].abnormalityObservation.value).toBe(false);
        expect(nodeForBP.children[0].showAbnormalIndicator).toBe(true);
        expect(nodeForBP.children[1].primaryObservation.concept.name).toBe('Diastolic');
        expect(nodeForBP.children[1].abnormalityObservation.value).toBe(undefined);
        expect(nodeForBP.children[1].showAbnormalIndicator).toBe(false);
    });

    var build = function(conceptData) {
        var concept = {
            uuid: conceptData.uuid || genUUID(),
            name: { name: conceptData.name || "conceptName"},
            datatype: {name: "N/A"},
            set: conceptData.set,
            setMembers: conceptData.setMembers || []
        };
        return concept;
    }; 
    
    var genUUID = function() { return (Math.random() * Math.pow(10, 16)).toString(); };
    
    var getConceptByName = function(concepts, conceptName) {
        var foundConcept = concepts.filter(function(concept) {
            return concept.name.name === conceptName;
        })[0];
        if(foundConcept) return foundConcept;
        concepts.forEach(function(concept){
            if(!foundConcept) foundConcept = getConceptByName(concept.setMembers, conceptName);
        });
        return foundConcept;
    };

    var getConcept = function(conceptName) {
        var openMRSConcept = getConceptByName([conceptSet], conceptName);
        return mapConcept(openMRSConcept);
    };

    var mapConcept = function(openMRSConcept) {
        return {uuid: openMRSConcept.uuid, name: openMRSConcept.name.name};
    };

    var buildObservation = function(observationData) {
        return {
            uuid: observationData.uuid || genUUID(),
            value: observationData.value,
            concept: observationData.concept,
            groupMembers: observationData.groupMembers
        }
    };

    var buildCompundObservation = function(groupMember, isAbnormal) {
        var groupMembers = [groupMember];
        if(isAbnormal !== undefined) groupMembers.push(buildObservation({value: isAbnormal ,concept: mapConcept(build({name: "IS_ABNORMAL"}))}));
        return buildObservation({concept: mapConcept(compoundObservationConcept), groupMembers: groupMembers})
    }
});







