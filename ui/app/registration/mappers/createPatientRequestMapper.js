'use strict';

Bahmni.Registration.CreatePatientRequestMapper = (function () {
    function CreatePatientRequestMapper(currentDate) {
        this.currentDate = currentDate;
    }

    CreatePatientRequestMapper.prototype.mapFromPatient = function (patientAttributeTypes, patient) {
        var constants = Bahmni.Registration.Constants;
        var openMRSPatient = {
            patient: {
                person: {
                    names: [
                        {
                            givenName: patient.givenName,
                            middleName: patient.middleName,
                            familyName: patient.familyName,
                            "preferred": false
                        }
                    ],
                    addresses: [_.pick(patient.address, constants.allAddressFileds)],
                    birthdate: this.getBirthdate(patient.birthdate, patient.age),
                    birthdateEstimated: patient.birthdateEstimated ,
                    gender: patient.gender,
                    birthtime: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(patient.birthtime),
                    personDateCreated: patient.registrationDate,
                    attributes: this.getMrsAttributes(patient, patientAttributeTypes),
                    dead:patient.dead,
                    deathDate: Bahmni.Common.Util.DateUtil.getDateWithoutTime(patient.deathDate),
                    causeOfDeath: patient.causeOfDeath != null ? patient.causeOfDeath.uuid : ''
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
        openMRSPatient.relationships = patient.relationships;
        return openMRSPatient;
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
            return attribute
        })
    };

    var setAttributeValue = function (attributeType, attr, value) {
        if (value === "" || value === null || value === undefined) {
            attr.voided = true;
        }
        else if (attributeType.format === "org.openmrs.Concept") {
            attr.value = _.find(attributeType.answers, function(answer){
               if(answer.conceptId === value)
                    return true;
            }).description;

            attr.hydratedObject = value;
        }
        else if(attributeType.format == "org.openmrs.util.AttributableDate"){
            var mnt = moment(value);
            attr.value = mnt.format('YYYY-MM-DD');
        }
        else {
            attr.value = value.toString();
        }
    };

    CreatePatientRequestMapper.prototype.getBirthdate = function (birthdate, age) {
        var mnt;
        if (birthdate) {
            mnt = moment(birthdate);
        } else if (age !== undefined) {
            mnt = moment(this.currentDate).subtract('days', age.days).subtract('months', age.months).subtract('years', age.years);
        }
        return mnt.format('YYYY-MM-DD');
    };

    return CreatePatientRequestMapper;
})();