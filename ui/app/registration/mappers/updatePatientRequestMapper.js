'use strict';

Bahmni.Registration.UpdatePatientRequestMapper = (function () {
    var UpdatePatientRequestMapper = function (currentDate) {
        this.currentDate = currentDate;
    };

    UpdatePatientRequestMapper.prototype.currentDate = undefined;

    UpdatePatientRequestMapper.prototype.mapFromPatient = function (patientAttributeTypes, openMRSPatient, patient) {
        var openMRSPatientProfile = {
            patient: {
                person: {
                    names: [
                        {
                            uuid: openMRSPatient.person.names[0].uuid,
                            givenName: patient.givenName,
                            middleName: patient.middleName,
                            familyName: patient.familyName,
                            display: patient.givenName + (patient.familyName ? " " + patient.familyName : ""),
                            "preferred": true
                        }
                    ],
                    addresses: [_.pick(patient.address, Bahmni.Registration.Constants.allAddressFileds)],
                    birthdate: this.getBirthdate(patient.birthdate, patient.age),
                    birthdateEstimated: patient.birthdateEstimated,
                    birthtime: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(patient.birthtime),
                    gender: patient.gender,
                    attributes: this.getMrsAttributes(openMRSPatient, patient, patientAttributeTypes),
                    dead: patient.dead,
                    deathDate: Bahmni.Common.Util.DateUtil.getDateWithoutTime(patient.deathDate),
                    causeOfDeath: patient.causeOfDeath ? patient.causeOfDeath.uuid : ''
                }
            }
        };

        var allIdentifiers = _.concat(patient.extraIdentifiers, patient.primaryIdentifier);
        var nonEmptyIdentifiers = _.filter(allIdentifiers, function (identifier) {
            return identifier.uuid || identifier.identifier;
        });

        openMRSPatientProfile.patient.identifiers = _.map(nonEmptyIdentifiers, function (identifier) {
            return {
                uuid: identifier.uuid,
                identifier: identifier.identifier,
                identifierType: identifier.identifierType.uuid,
                preferred: identifier.preferred,
                voided: identifier.voided
            };
        });

        this.setImage(patient, openMRSPatientProfile);

        if (patient.relationships) {
            openMRSPatientProfile.relationships = patient.relationships;
        }

        return openMRSPatientProfile;
    };

    UpdatePatientRequestMapper.prototype.setImage = function (patient, openMRSPatient) {
        if (patient.getImageData()) {
            openMRSPatient.image = patient.getImageData();
        }
    };

    UpdatePatientRequestMapper.prototype.getMrsAttributes = function (openMRSPatient, patient, patientAttributeTypes) {
        var attributes = [];
        patientAttributeTypes.forEach(function (attributeType) {
            var attr = {
                attributeType: {
                    uuid: attributeType.uuid
                }
            };
            var savedAttribute = openMRSPatient.person.attributes.filter(function (attribute) {
                return attributeType.uuid === attribute.attributeType.uuid;
            })[0];

            if (savedAttribute) {
                attr.uuid = savedAttribute.uuid;
                setAttributeValue(attributeType, attr, patient[savedAttribute.attributeType.display]);
            } else {
                setAttributeValue(attributeType, attr, patient[attributeType.name]);
            }
            attributes.push(attr);
        });
        return attributes;
    };

    var setAttributeValue = function (attributeType, attr, value) {
        if (value === "" || value === null || value === undefined || value.conceptUuid === null) {
            attr.voided = true;
        } else if (attributeType.format === "org.openmrs.Concept") {
            attr.hydratedObject = value.conceptUuid;
        } else if (attributeType.format === "org.openmrs.util.AttributableDate") {
            var mnt = moment(value);
            attr.value = mnt.format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
        } else {
            attr.value = value.toString();
        }
    };

    UpdatePatientRequestMapper.prototype.getBirthdate = function (birthdate, age) {
        var mnt;
        if (birthdate) {
            mnt = moment(birthdate);
        } else if (age !== undefined) {
            mnt = moment(this.currentDate).subtract('days', age.days).subtract('months', age.months).subtract('years', age.years);
        }
        return mnt.format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
    };

    return UpdatePatientRequestMapper;
})();
