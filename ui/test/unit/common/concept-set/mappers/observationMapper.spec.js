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

    it('should map observations with ui config', function () {
        var conceptSet = 
            build({name: "VITALS_CONCEPT", set: true,
                setMembers : [
                    build({name: "Pulse"}),
                    build({name: "BP", set: true, setMembers: [build({name: "Systolic"}), build({name: "Diastolic"})]}),
                    build({name: "Sugar"})
                ]});
        var conceptSetUIConfig = {
            "Pulse": {},
            "BP": {
                "Systolic": {showAbnormalIndicator: true},
                "Diastolic": {showAbnormalIndicator: false}
            }
        };
        var compoundObservation = build({name: "XCompoundObservation", 
            set: true, 
            setMembers: [
                build({name: "IS_ABNORMAL"})
            ]
        });
        
        var observationMapper = new Bahmni.ConceptSet.ObservationMapper(conceptSetUIConfig, compoundObservation);
        var rootObservation = observationMapper.map([], conceptSet);
        expect(rootObservation.concept.name).toBe('XCompoundObservation');
        
        var vitalsObservation = getObservations(rootObservation.groupMembers, "VITALS_CONCEPT")[0];
        expect(vitalsObservation).toBeDefined();
        
        var vitalsGroup = vitalsObservation.groupMembers;
        expect(vitalsGroup.length).toBe(3);

        var pulseObservation = getXObservationByConceptName(vitalsGroup, 'Pulse')[0];
        expect(pulseObservation).toBeDefined();

        var pulseObservationIsAbnormal = getObservations(pulseObservation.groupMembers, 'IS_ABNORMAL');
        expect(pulseObservationIsAbnormal.length).toBe(1);

        var sugarObservation = getXObservationByConceptName(vitalsGroup, 'Sugar')[0];
        expect(sugarObservation).toBeDefined();

        var xBpObservation = getXObservationByConceptName(vitalsGroup, 'BP')[0];
        expect(xBpObservation).toBeDefined(); 

        var bpObservation = getObservations(xBpObservation.groupMembers, 'BP')[0];
        expect(bpObservation.groupMembers.length).toBe(2);

        var xSystolicObservation = getXObservationByConceptName(bpObservation.groupMembers, 'Systolic')[0];
        expect(xSystolicObservation).toBeDefined();

        var systolicObservation = getObservations(xSystolicObservation.groupMembers, 'Systolic');
        expect(systolicObservation).toBeDefined();

        var systolicIsAbnormal = getObservations(xSystolicObservation.groupMembers, 'IS_ABNORMAL');
        expect(systolicIsAbnormal).toBeDefined();
    });
});







