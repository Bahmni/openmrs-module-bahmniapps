'use strict';

describe('AttributeFormatter', function () {

    it('should map values from the openmrs patientAttributeTypes to our patientConfig', function () {
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
                "answers": [
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
            "caste": "cast",
            "class": "10",
            "testDate": "Fri Jan 01 1999 00:00:00",
            "isUrban": false
        };

        var attributes = new Bahmni.Common.Domain.AttributeFormatter().getMrsAttributes(model, patientAttributeTypes);


        expect(attributes).toContain({
            attributeType: {uuid: 'caste-uuid'},
            hydratedObject: 'cast'
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

    it("should remove unfilled attributes", function(done) {
        var formattedAttributes = [{
            "attributeType": {"uuid": "5674699d-c5c7-4e2a-bc08-ff165939c1ff"},
            "value": "abcd"
        }, {
            "attributeType": {"uuid": "db8b0fb2-b1a2-4ff0-bcf0-e714ac80375b"},
            "voided": true
        }];

        var attributes = new Bahmni.Common.Domain.AttributeFormatter().removeUnfilledAttributes(formattedAttributes);

        expect(attributes).toEqual([{
                "attributeType": {"uuid": "5674699d-c5c7-4e2a-bc08-ff165939c1ff"},
                "value": "abcd"
            }]
        );

        done();
    });
});
