'use strict';

var CreatePatientRequestMapper = (function () {

    function CreatePatientRequestMapper(currentDate) {
        this.currentDate = currentDate;
    }

    CreatePatientRequestMapper.prototype.mapFromPatient = function (patientAttributeTypes, patient) {
        var openMRSPatient = {
            patient: {
                person: {
                    names: [
                        {
                            givenName: patient.givenName,
                            familyName: patient.familyName,
                            "preferred": false
                        }
                    ],
                    addresses: [
                        {
                            address1: patient.address.address1,
                            address2: patient.address.address2,
                            address3: patient.address.address3,
                            cityVillage: patient.address.cityVillage,
                            countyDistrict: patient.address.countyDistrict,
                            stateProvince: patient.address.stateProvince
                        }
                    ],
                    birthdate: this.getBirthdate(patient.birthdate, patient.age),
                    birthdateEstimated: patient.birthdate === undefined,
                    gender: patient.gender,
                    personDateCreated: patient.registrationDate,
                    attributes: this.getMrsAttributes(patient, patientAttributeTypes)
                },
                identifiers: [
                    {
                        identifier: patient.identifier,
                        "identifierType": {
                           "name": constants.patientIdentifierTypeName
                        },
                        "preferred": true,
                        "voided": false
                    }
                ]

            }
        };

        this.setImage(patient, openMRSPatient);
        return  openMRSPatient;
    };

    CreatePatientRequestMapper.prototype.setImage = function (patient, openMRSPatient) {
        if (patient.getImageData()) {
            openMRSPatient.image = patient.getImageData()
        }
    };

    CreatePatientRequestMapper.prototype.getMrsAttributes = function (patient, patientAttributeTypes) {
        return patientAttributeTypes.map(function (result) {
            var attribute = {
                attributeType: { 
                    uuid: result.uuid
                }
            };
            setAttributeValue(result, attribute, patient[result.name]);
            return  attribute
        })
    };

    var setAttributeValue = function (attributeType, attr, value) {
        if (attributeType.format === "org.openmrs.Concept") {
            attr.hydratedObject = value;
        } else {
            attr.value = value;
        }
    };

    CreatePatientRequestMapper.prototype.getBirthdate = function (birthdate, age) {
        var mnt;
        if (birthdate !== undefined) {
            mnt = moment(birthdate, 'DD-MM-YYYY');
        } else if (age !== undefined) {
            mnt = moment(this.currentDate).subtract('years', age.years).subtract('months', age.months).subtract('days', age.days);
        }
        return mnt.format('YYYY-MM-DD');
    };

    return CreatePatientRequestMapper;
})();