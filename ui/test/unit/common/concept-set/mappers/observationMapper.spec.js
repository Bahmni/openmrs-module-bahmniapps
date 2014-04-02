'use strict';

describe("ObservationMapper", function () {
    var build = function(conceptData) {
        var concept = {
            name: {name: conceptData.name || "conceptName"},
            datatype: {name: "N/A"},
            set: conceptData.set,
            setMembers: conceptData.setMembers || []
        };
        return concept;
    }, 
    getObservations = function(observations, conceptName) {
        return observations.filter(function(obs) {
            return obs.concept.name === conceptName;
        });
    },
    getXObservationByConceptName = function(xObservations, conceptName) {
        return xObservations.filter(function(xObs) {
            return xObs.groupMembers.some(function(groupMember) {
                return groupMember.concept.name === conceptName;
            });
        });
    };

    it('should map new observations with given concept set and ui config', function () {
        var conceptSet = 
            build({name: "VITALS_CONCEPT", set: true,
                setMembers : [
                    build({name: "Pulse"}),
                    build({name: "BP", set: true, setMembers: [build({name: "Systolic"}), build({name: "Diastolic"})]}),
                    build({name: "Sugar"})
                ]});
        var conceptSetUIConfig = {
            "Pulse": {},
            "Systolic": {showAbnormalIndicator: true},
            "Diastolic": {showAbnormalIndicator: false}
        };
        var compoundObservation = build({name: "XCompoundObservation", 
            set: true, 
            setMembers: [ build({name: "IS_ABNORMAL"})]
        });
        
        var observationMapper = new Bahmni.ConceptSet.ObservationMapper(conceptSetUIConfig, compoundObservation);
        var rootNode = observationMapper.map([], conceptSet);

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
});







