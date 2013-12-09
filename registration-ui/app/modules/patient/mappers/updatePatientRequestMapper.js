'use strict';

var UpdatePatientRequestMapper = (function () {
    var ObjectUtil = Bahmni.Registration.Util.ObjectUtil;

    UpdatePatientRequestMapper.prototype.currentDate = undefined;

    function UpdatePatientRequestMapper(currentDate) {
        this.currentDate = currentDate;
    }
    
    UpdatePatientRequestMapper.prototype.mapFromPatient = function (patientAttributeTypes, openMRSPatient, patient) {        
        var openMRSPatientProfile = {
            patient: {
                person: {
                    names: [
                        {
                            uuid: openMRSPatient.person.names[0].uuid,
                            givenName: patient.givenName,
                            familyName: patient.familyName,
                            "preferred": true
                        }
                    ],
                    addresses: [ObjectUtil.slice(patient.address, constants.allAddressFileds)],
                    birthdate: this.getBirthdate(patient.birthdate, patient.age),
                    birthdateEstimated: patient.birthdate === undefined || patient.birthdate === "",
                    gender: patient.gender,
                    attributes: this.getMrsAttributes(openMRSPatient, patient, patientAttributeTypes)
                }
            }
        };

        this.setImage(patient, openMRSPatientProfile);
        return  openMRSPatientProfile;
    };

    UpdatePatientRequestMapper.prototype.setImage = function (patient, openMRSPatient) {
        if (patient.getImageData()) {
            openMRSPatient.image = patient.getImageData()
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
        if (attributeType.format === "org.openmrs.Concept") {
            attr.hydratedObject = value;
        } else {
            attr.value = value;
        }
    };

    UpdatePatientRequestMapper.prototype.getBirthdate = function (birthdate, age) {
        var mnt;
        if (birthdate !== undefined && birthdate !== "") {
            mnt = moment(birthdate, 'DD-MM-YYYY');
        } else if (age !== undefined) {
            mnt = moment(this.currentDate).subtract('years', age.years).subtract('months', age.months).subtract('days', age.days);
        }
        return mnt.format('YYYY-MM-DD');
    };

    return UpdatePatientRequestMapper;

})();