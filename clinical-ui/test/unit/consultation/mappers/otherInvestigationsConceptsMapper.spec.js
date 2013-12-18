'use strict';

describe("OtherInvestigationsConceptsMapper", function () {
    var createTest = function(uuid, name) {
        return { uuid: uuid, name: { name: name}, conceptClass: { name: Bahmni.Opd.Consultation.Constants.testConceptName}}  
    }

    var otherInvestigationsConceptSet = { 
        name: {name: Bahmni.Opd.Consultation.Constants.otherInvestigationsConceptSetName},
        setMembers: [
            {
                name: { name: "Radiology"},
                conceptClass: { name: "ConvSet"}, set: true,
                setMembers: [
                    createTest("1-1-1", "Chest XRay"),
                    createTest("2-2-2", "Head Scan"),
                    createTest("3-3-3", "Body Scan")
                ]
            },
            {
                name: { name: "Endoscopy"},
                conceptClass: { name: "ConvSet"}, set: true,
                setMembers: [
                    createTest("4-4-4", "Colonoscopy"),
                    createTest("5-5-5", "Endoscopic Ultrasound (EUS)")
                ]
            }            
        ]
    };
    
    var categoriesConceptSet = {
        setMembers: [
            {
                name: { name: "XRay"},
                setMembers: [ {uuid: "1-1-1"}]
            },
            {
                name: { name: "Scan"},
                setMembers: [ {uuid: "2-2-2"}, {uuid: "3-3-3"} ]
            }        
        ]
    };

    describe("map", function(){
        var mapper;
        var orderTypesMap;

        beforeEach(function(){
            orderTypesMap = {
                "Radiology": "Radiology Order",
                "Endoscopy": "Endoscopy Order",
            };
            mapper = new Bahmni.Opd.OtherInvestigationsConceptsMapper(orderTypesMap);
        });

        it('should map other investigations concepts to tests associated to type, category and orderTypeName', function () {
            var tests = mapper.map(otherInvestigationsConceptSet, categoriesConceptSet);

            expect(tests.length).toBe(5);
            expect(tests[0].name).toBe('Chest XRay');
            expect(tests[0].type.name).toEqual('Radiology');
            expect(tests[0].orderTypeName).toEqual(orderTypesMap.Radiology);
            expect(tests[0].category.name).toEqual('XRay');
            var radiology = tests[0].type;
            expect(tests[1].name).toBe('Head Scan');
            expect(tests[1].type).toEqual(radiology);
            expect(tests[1].orderTypeName).toEqual(orderTypesMap.Radiology);
            expect(tests[1].category.name).toBe('Scan');
            var scan = tests[1].category;
            expect(tests[2].category).toEqual(scan);
            expect(tests[3].category).toEqual(undefined);
            expect(tests[3].orderTypeName).toEqual(orderTypesMap.Endoscopy);
        });

        it("should return zero tests when otherInvestigationsConceptSet does not exist", function(){
            var tests = mapper.map(null, categoriesConceptSet);

            expect(tests.length).toBe(0);
        });

        it("should map wthout categories when categoriesConceptSet does not exist", function(){
            var tests = mapper.map(otherInvestigationsConceptSet, null);

            expect(tests.length).toBe(5);
        });
    });
});

