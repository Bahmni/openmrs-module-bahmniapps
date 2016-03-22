'use strict';

describe("PatientConfig", function(){
    var samplePersonAttributeTypes = function() {
        return [
            {uuid: "uuid1", name: "healthCenter"},
            {uuid: "uuid2", name: "givenNameLocal"},
            {uuid: "uuid3", name: "familyNameLocal"},
            {uuid: "uuid4", name: "caste"},
            {uuid: "uuid5", name: "address"}
        ];
    }

    var patientInfo = function() {
        return {
                "additionalPatientInformation": {
                    "title": "Additional Patient Information",
                    "attributes": [
                        "caste"
                    ],
                    "order": 2
                },
                "Address": {
                     "title": "Address",
                      "attributes": [
                        "address"
                      ],
                     "order": 1
                }
        }
    }

    it("should get attributeTypes by UUID", function() {
        var config = new Bahmni.Registration.PatientConfig(samplePersonAttributeTypes());
        expect(config.get("uuid1").name).toEqual("healthCenter");
        expect(config.get("uuid3").name).toEqual("familyNameLocal");
    });

    it("should add autocomplete config for caste", function() {
        var config = new Bahmni.Registration.PatientConfig(samplePersonAttributeTypes());
        config.customAttributeRows();
        var caste = config.get("uuid4");
        expect(caste.responseMap).not.toBeNull();
        expect(caste.src).not.toBeNull();
    })

    it("should return heathCentreAttribute", function() {
        var config = new Bahmni.Registration.PatientConfig(samplePersonAttributeTypes());
        expect(config.heathCentreAttribute()).toEqual({uuid: "uuid1", name: "healthCenter"});
    });

    it("should set showNameField to be false if attribute does not given or middle or family local name", function() {
        var config = new Bahmni.Registration.PatientConfig(samplePersonAttributeTypes());
        expect(config.local().showNameField).toBeFalsy();
    });

    it("should get the patientAttributeSections through key as section name", function() {
        var config = new Bahmni.Registration.PatientConfig(samplePersonAttributeTypes(),null,patientInfo());
        expect(config.getPatientAttributesSections().additionalPatientInformation).toBeDefined();
    });

    it("should get the ordered patientAttributeSections", function() {
        var config = new Bahmni.Registration.PatientConfig(samplePersonAttributeTypes(),null,patientInfo());
        expect(config.getOrderedPatientAttributesSections()[0].title).toBe('Address');
        expect(config.getOrderedPatientAttributesSections()[0]).toBeDefined();
        expect(config.getOrderedPatientAttributesSections().additionalPatientInformation).toBeUndefined();
    });
});