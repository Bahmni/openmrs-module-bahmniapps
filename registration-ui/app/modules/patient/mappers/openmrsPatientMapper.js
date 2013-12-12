'use strict';

angular.module('registration.patient.mappers').factory('openmrsPatientMapper', ['patient', '$rootScope', 'age',
    function (patientModel, $rootScope, age) {
        var whereAttributeTypeExists = function (attribute) {
                return $rootScope.patientConfiguration.get(attribute.attributeType.uuid);
            },
            addAttributeToPatient = function (patient, attribute) {
                var attributeType = $rootScope.patientConfiguration.get(attribute.attributeType.uuid);
                if (attributeType) {
                    if (attributeType.format === "org.openmrs.Concept" && attribute.value) {
                        patient[attributeType.name] = attribute.value.uuid;
                    } else {
                        patient[attributeType.name] = attribute.value;
                    }
                }
            },
            mapAttributes = function (patient, attributes) {
                attributes.filter(whereAttributeTypeExists).forEach(function (attribute) {
                    addAttributeToPatient(patient, attribute);

                });
            },
            pad = function (number) {
                return number > 9 ? number.toString() : "0" + number.toString();
            },
            parseDate = function (dateStr) {
                return dateStr ? new Date(dateStr.substr(0, 10)) : dateStr;
            },
            getDateStr = function (date) {
                return date ? pad(date.getDate()) + "-" + pad(date.getMonth() + 1) + "-" + date.getFullYear() : "";
            },
            mapAddress = function (preferredAddress) {
                return preferredAddress || {};
            },
            map = function (openmrsPatient) {
                var patient = patientModel.create(),
                    birthdate = parseDate(openmrsPatient.person.birthdate);
                patient.givenName = openmrsPatient.person.preferredName.givenName;
                patient.familyName = openmrsPatient.person.preferredName.familyName;
                patient.birthdate = openmrsPatient.person.birthdateEstimated || !birthdate ? "" : getDateStr(birthdate);
                patient.age = birthdate ? age.fromBirthDate(parseDate(openmrsPatient.person.birthdate)) : null;
                patient.gender = openmrsPatient.person.gender;
                patient.address = mapAddress(openmrsPatient.person.preferredAddress);
                patient.identifier = openmrsPatient.identifiers[0].identifier;
                patient.image = constants.baseOpenMRSRESTURL + "/personimage/" + openmrsPatient.uuid + ".jpeg" + "?q=" + new Date().getTime();
                patient.registrationDate = parseDate(openmrsPatient.person.auditInfo.dateCreated);
                mapAttributes(patient, openmrsPatient.person.attributes);
                return patient;
            };

        return {
            map: map
        };
    }]);