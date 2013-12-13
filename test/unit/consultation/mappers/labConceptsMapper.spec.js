'use strict';

describe("LabConceptsMapper", function () {

    var createTest = function(uuid, name) {
        return { uuid: uuid, name: { name: name}, conceptClass: { name: "Test"}}  
    }

    var labConceptSet = { 
        name: {name: 'Laboratory'},
        setMembers: [
            {
                name: { name: "Blood"},
                conceptClass: { name: "ConvSet"},
                setMembers: [
                    {
                        name: { name: "Anaemia Panel"},
                        conceptClass: { name: "LabSet"},
                        setMembers: [ createTest("1-1-1", "Absolute Eosinphil Count") ]
                    },
                    createTest("2-2-2", "Hb1AC"),
                    createTest("3-3-3", "ATTT"),
                    createTest("4-4-4", "Morphology")
                ]
            }
        ]
    };
    
    var departmentsConceptSet = {
        setMembers: [
            {
                name: { name: "Haematology"},
                setMembers: [ {uuid: "1-1-1"}, {uuid: "2-2-2"} ]
            },
            {
                name: { name: "Clinical Pathology"},
                setMembers: [ {uuid: "3-3-3"}]
            },
        ]
    };

    it('should map lab concepts to samples panels and tests', function () {
        var labEntities = new Bahmni.Opd.LabConceptsMapper().map(labConceptSet, departmentsConceptSet);

        expect(labEntities).not.toBe(null);
        expect(labEntities.samples[0].name).toBe('Blood');
        var bloodSample = labEntities.samples[0];
        expect(labEntities.panels[0].name).toBe('Anaemia Panel');
        expect(labEntities.panels[0].sample).toEqual(bloodSample);
        var anaemiaPanel = labEntities.panels[0];
        expect(labEntities.tests.length).toBe(4);
        expect(labEntities.tests[0].name).toBe('Absolute Eosinphil Count');
        expect(labEntities.tests[0].panels).toEqual([anaemiaPanel]);
        expect(labEntities.tests[0].sample).toEqual(bloodSample);
        expect(labEntities.tests[0].department.name).toEqual('Haematology');
        var haematologyDepartment = labEntities.tests[0].department;
        expect(labEntities.tests[1].name).toBe('Hb1AC');
        expect(labEntities.tests[1].panels).toEqual([]);
        expect(labEntities.tests[1].sample).toEqual(bloodSample);
        expect(labEntities.tests[1].department).toBe(haematologyDepartment);
        expect(labEntities.tests[2].department.name).toEqual('Clinical Pathology');
        expect(labEntities.tests[3].department).toEqual(undefined);
    });
});

