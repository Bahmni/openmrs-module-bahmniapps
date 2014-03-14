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
    }

    it('should map observations with ui config', function () {
        var observationMapper = new Bahmni.ConceptSet.ObservationMapper();
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
                "Systolic": {abnormalIndicator: true},
                "Diastolic": {abnormalIndicator: false}
            }
        }
        
        var rootObservation = observationMapper.map([], conceptSet, conceptSetUIConfig);

        expect(rootObservation.concept.name).toBe('VITALS_CONCEPT');
        expect(rootObservation.groupMembers.length).toBe(3);
        expect(rootObservation.groupMembers[0].concept.name).toBe('Pulse');
        expect(rootObservation.groupMembers[0].conceptUIConfig).toBe(conceptSetUIConfig["Pulse"]);
        
        expect(rootObservation.groupMembers[1].concept.name).toBe('BP');
        var bpObservation = rootObservation.groupMembers[1];
        expect(bpObservation.conceptUIConfig).toBe(conceptSetUIConfig["BP"]);
        expect(bpObservation.groupMembers.length).toBe(2);
        expect(bpObservation.groupMembers[0].conceptUIConfig).toBe(conceptSetUIConfig["BP"]["Systolic"]);
        expect(bpObservation.groupMembers[1].conceptUIConfig).toBe(conceptSetUIConfig["BP"]["Diastolic"]);

        expect(rootObservation.groupMembers[2].concept.name).toBe('Sugar');
        expect(rootObservation.groupMembers[2].conceptUIConfig).toEqual({});
    });
});







