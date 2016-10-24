'use strict';

describe("LabConceptsMapper", function () {
    var labConceptSet;    
    var departmentsConceptSet;
    var createTest = function(uuid, name) {
        return { uuid: uuid, name: { name: name}, conceptClass: { name: Bahmni.Clinical.Constants.testConceptName}}  
    }

    beforeEach(function(){
        labConceptSet = { 
            name: {name: Bahmni.Clinical.Constants.labConceptSetName},
            setMembers: [
                {
                    name: { name: "Blood"},
                    conceptClass: { name: "ConvSet"},
                    setMembers: [
                        {
                            name: { name: "Anaemia Panel"},
                            conceptClass: { name: Bahmni.Clinical.Constants.labSetConceptName},
                            setMembers: [ createTest("1-1-1", "Absolute Eosinphil Count") ]
                        },
                        {
                            name: { name: "Misconfigured Panel With Wrong conceptClass"},
                            conceptClass: { name: "SomeSet"},
                            setMembers: [ createTest("x-x-x", "MisconfiguredTest") ]
                        },
                        createTest("2-2-2", "Hb1AC"),
                        createTest("3-3-3", "ATTT"),
                        createTest("4-4-4", "Morphology")
                    ]
                }
            ]
        };        

        departmentsConceptSet = {
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
    });

    describe("map", function(){
        var mapper;

        beforeEach(function(){
            mapper = new Bahmni.LabConceptsMapper();
        });

        it('should map lab concepts to tests associated to panels and department', function () {
            var tests = mapper.map(labConceptSet, departmentsConceptSet);

            expect(tests.length).toBe(4);
            expect(tests[0].name).toBe('Absolute Eosinphil Count');
            expect(tests[0].set).toBe(false);
            expect(tests[0].panels[0].name).toEqual('Anaemia Panel');
            expect(tests[0].sample.name).toEqual('Blood');
            expect(tests[0].orderTypeName).toEqual(Bahmni.Clinical.Constants.labOrderType);
            expect(tests[0].panels[0].orderTypeName).toEqual(Bahmni.Clinical.Constants.labOrderType);
            expect(tests[0].panels[0].set).toEqual(true);
            expect(tests[0].department.name).toEqual('Haematology');
            var bloodSample = tests[0].sample;
            var haematologyDepartment = tests[0].department;
            expect(tests[1].name).toBe('Hb1AC');
            expect(tests[1].panels).toEqual([]);
            expect(tests[1].sample).toEqual(bloodSample);
            expect(tests[1].orderTypeName).toEqual(Bahmni.Clinical.Constants.labOrderType);
            expect(tests[1].department).toBe(haematologyDepartment);
            expect(tests[2].department.name).toEqual('Clinical Pathology');
            expect(tests[3].department).toEqual(undefined);
        });

        it("should map the tests belonging to multiple panels as single test", function(){
            var testConcept = createTest("1-1-1", "Test1")
            var panelConcept1 = {name: { name: "Panel1"}, setMembers: [testConcept], conceptClass: { name: Bahmni.Clinical.Constants.labSetConceptName}};
            var panelConcept2 = {name: { name: "Panel2"}, setMembers: [testConcept], conceptClass: { name: Bahmni.Clinical.Constants.labSetConceptName}};
            var sampleConcept = {name: { name: "Blood"}, conceptClass: { name: "ConvSet"}, setMembers: [panelConcept1, panelConcept2]};
            labConceptSet.setMembers = [sampleConcept];

            var tests = mapper.map(labConceptSet, departmentsConceptSet);

            expect(tests.length).toBe(1);
            expect(tests[0].panels.length).toBe(2);
        });

        it("should map the tests belonging to multiple panels as single test", function(){
            var testConcept = createTest("1-1-1", "Test1")
            var panelConcept1 = {name: { name: "Panel1"}, setMembers: [testConcept], conceptClass: { name: Bahmni.Clinical.Constants.labSetConceptName}};
            var sampleConcept = {name: { name: "Blood"}, conceptClass: { name: "ConvSet"}, setMembers: [panelConcept1, testConcept]};
            labConceptSet.setMembers = [sampleConcept];

            var tests = mapper.map(labConceptSet, departmentsConceptSet);

            expect(tests.length).toBe(1);
            expect(tests[0].panels.length).toBe(1);
            expect(tests[0].sample.name).toBe(sampleConcept.name.name);
        });

        it("should return zero tests when labConceptSet does not exist", function(){
            var tests = mapper.map(null, departmentsConceptSet);

            expect(tests.length).toBe(0);
        });

        it("should map wthout categories when departmentsConceptSet does not exist", function(){
            var tests = mapper.map(labConceptSet, null);

            expect(tests.length).toBe(4);
        });
    });
});

