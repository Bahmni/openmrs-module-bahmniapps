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
                    attributes: new Bahmni.Common.Domain.AttributeFormatter().getMrsAttributes(patient, patientAttributeTypes),
                    dead:patient.dead,
                    deathDate: Bahmni.Common.Util.DateUtil.getDateWithoutTime(patient.deathDate),
                    causeOfDeath: patient.causeOfDeath != null ? patient.causeOfDeath.uuid : '',
                    uuid: patient.uuid
                },
                identifiers: [
                    {
                        identifierPrefix: patient.identifierPrefix ? patient.identifierPrefix.prefix : "",
                        identifier: patient.identifier,
                        "preferred": true,
                        "voided": false
                    }
                ],
                uuid: patient.uuid
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

    CreatePatientRequestMapper.prototype.getBirthdate = function (birthdate, age) {
        var mnt;
        if (birthdate) {
            mnt = moment(birthdate);
        } else if (age !== undefined) {
            mnt = moment(this.currentDate).subtract('days', age.days).subtract('months', age.months).subtract('years', age.years);
        }
        return mnt.format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
    };

    return CreatePatientRequestMapper;
})();