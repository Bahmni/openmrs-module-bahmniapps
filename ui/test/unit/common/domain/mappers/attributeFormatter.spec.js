'use strict';

describe('AttributeFormatter', function () {
    var patientAttributeTypes = [
        {
            "uuid": "class-uuid",
            "sortWeight": 2.0,
            "name": "class",
            "description": "Caste",
            "format": "java.lang.String",
            "answers": []
        },
        {
            "uuid": "caste-uuid",
            "sortWeight": 2.0,
            "name": "caste",
            "description": "Class",
            "format": "org.openmrs.Concept",
            "answers": [ {"description": "cast", "conceptId": "12"},
                {"description": "OBC", "conceptId": "10"}
            ]
        },
        {
            "uuid": "education-uuid",
            "sortWeight": 2.0,
            "name": "education",
            "description": "Caste",
            "format": "java.lang.String",
            "answers": []
        },
        {
            "uuid": "isUrban-uuid",
            "sortWeight": 2.0,
            "name": "isUrban",
            "description": "isUrban",
            "format": "java.lang.Boolean",
            "answers": []
        },
        {
            "uuid": "testDate-uuid",
            "sortWeight": 2.0,
            "name": "testDate",
            "description": "Test Date",
            "format": "org.openmrs.util.AttributableDate",
            "answers": []
        }
    ];


    var model = {
        "caste": {"conceptUuid":"10","value":"ten"},
        "class": "10",
        "testDate": "Fri Jan 01 1999 00:00:00",
        "isUrban": false
    };

    it('should map values from the openmrs patientAttributeTypes to our patientConfig', function () {
        var attributes = new Bahmni.Common.Domain.AttributeFormatter().getMrsAttributes(model, patientAttributeTypes);

        expect(attributes).toContain({
            attributeType: {uuid: 'caste-uuid'},
            value: 'OBC',
            hydratedObject: '10'
        });
        expect(attributes).toContain({
            value: "10",
            attributeType: {uuid: 'class-uuid'}
        });

        expect(attributes).toContain({
            value: "false",
            attributeType: {uuid: 'isUrban-uuid'}
        });

        expect(attributes).toContain({
            value: "1999-01-01",
            attributeType: {uuid: 'testDate-uuid'}
        });
    });

    it('should map values from the openmrs patientAttributeTypes to attributes if already existing', function () {
        var oldAttributes = [   {attributeType: {uuid: 'class-uuid'}, value: '12', uuid :"classAttribute"},
                                {attributeType: {uuid: 'caste-uuid'}, value:"10", hydrated: 'castE', uuid :"casteAttribute"},
                                {attributeType: {uuid: 'education-uuid'}, voided: true, uuid :"educationAttribute"},
                                {attributeType: {uuid: 'isUrban-uuid'}, value: 'true', uuid :"isUrbanAttribute"}];

        var attributes = new Bahmni.Common.Domain.AttributeFormatter().getMrsAttributesForUpdate(model, patientAttributeTypes,oldAttributes);
        expect(attributes).toContain({
            attributeType: {uuid: 'caste-uuid'},
            hydratedObject: '10',
            value:'OBC',
            uuid :"casteAttribute"
        });
        expect(attributes).toContain({
            value: "10",
            attributeType: {uuid: 'class-uuid'},
            uuid :"classAttribute"
        });

        expect(attributes).toContain({
            value: "false",
            attributeType: {uuid: 'isUrban-uuid'},
            uuid :"isUrbanAttribute"
        });

        expect(attributes).toContain({
            value: "1999-01-01",
            attributeType: {uuid: 'testDate-uuid'}
        });
    });

    it('should filter unchanged attributes from mapped the openmrs attributes', function () {
        var oldAttributes = [{attributeType: {uuid: 'caste-uuid'}, voided: true}];

        var attributes = new Bahmni.Common.Domain.AttributeFormatter().getMrsAttributesForUpdate(model, patientAttributeTypes,oldAttributes);
        expect(attributes).toBeEmpty();
    });

    it("should remove unfilled attributes", function(done) {
        var formattedAttributes = [
            {
                "attributeType": {"uuid": "5674699d-c5c7-4e2a-bc08-ff165939c1ff"},
                "value": "abcd"
            },
            {
                "attributeType": {"uuid": "db8b0fb2-b1a2-4ff0-bcf0-e714ac80375b"},
                "voided": true
            },
            {
                "attributeType": {"uuid": "db8b0fb2-b1a2-4ff0-bcf0-e714ac80375c"},
                "voided": true,
                "uuid": "db8b0fb2-b1a2-4ff0-bcf0-dfgrc80375c"
            }
        ];

        var attributes = new Bahmni.Common.Domain.AttributeFormatter().removeUnfilledAttributes(formattedAttributes);

        expect(attributes).toEqual(
            [
                {
                    "attributeType": {"uuid": "5674699d-c5c7-4e2a-bc08-ff165939c1ff"},
                    "value": "abcd"
                },
                {
                    "attributeType": {"uuid": "db8b0fb2-b1a2-4ff0-bcf0-e714ac80375c"},
                    "voided": true,
                    "uuid": "db8b0fb2-b1a2-4ff0-bcf0-dfgrc80375c"
                }
            ]
        );

        done();
    });
});
