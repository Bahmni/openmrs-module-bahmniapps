'use strict';

angular.module('bahmni.registration').factory('openmrsPatientMapper', ['patient', '$rootScope', 'age',
    function (patientModel, $rootScope, age) {
        var whereAttributeTypeExists = function (attribute) {
                return $rootScope.patientConfiguration.get(attribute.attributeType.uuid);
            },
            addAttributeToPatient = function (patient, attribute) {
                var attributeType = $rootScope.patientConfiguration.get(attribute.attributeType.uuid);
                if (attributeType) {
                    if (attributeType.format === "org.openmrs.Concept" && attribute.value) {
                        patient[attributeType.name] = attribute.value.uuid;
                    }
                    else if (attributeType.format === "org.openmrs.util.AttributableDate") {
                        patient[attributeType.name] = parseDate(attribute.value);
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
            parseDate = function (dateStr) {
                return Bahmni.Common.Util.DateUtil.parseServerDateToDate(dateStr);
            },
            mapAddress = function (preferredAddress) {
                return preferredAddress || {};
            },
            mapRelationships = function(patient, relationships){
                patient.relationships = relationships || [];
                patient.newlyAddedRelationships = [{}];
            },
            map = function (openmrsPatient) {
                var relationships = openmrsPatient.relationships;
                var openmrsPatient = openmrsPatient.patient;
                var openmrsPerson = openmrsPatient.person;
                var patient = patientModel.create();
                var birthDate = parseDate(openmrsPerson.birthdate);
                patient.uuid = openmrsPatient.uuid;
                patient.givenName = openmrsPerson.preferredName.givenName;
                patient.middleName = openmrsPerson.preferredName.middleName;
                patient.familyName = openmrsPerson.preferredName.familyName;
                patient.birthdate = !birthDate ? null : birthDate;
                patient.age = birthDate ? age.fromBirthDate(birthDate) : null;
                patient.gender = openmrsPerson.gender;
                patient.address = mapAddress(openmrsPerson.preferredAddress);
                patient.birthtime = parseDate(openmrsPerson.birthtime);
                patient.identifier = openmrsPatient.identifiers[0].identifier;
                patient.registrationNumber = openmrsPatient.identifiers[0].registrationNumber;
                patient.identifierPrefix.prefix = openmrsPatient.identifiers[0].identifierPrefix;
                patient.image = Bahmni.Registration.Constants.patientImageURL + openmrsPatient.uuid + ".jpeg?q=" + new Date().toISOString();
                patient.registrationDate = parseDate(openmrsPerson.auditInfo.dateCreated);
                patient.dead = openmrsPerson.dead;
                patient.deathDate = parseDate(openmrsPerson.deathDate);
                patient.causeOfDeath = openmrsPerson.causeOfDeath;
                patient.birthdateEstimated = openmrsPerson.birthdateEstimated;
                patient.bloodGroup = openmrsPerson.bloodGroup;
                mapAttributes(patient, openmrsPerson.attributes);
                mapRelationships(patient, relationships);
                return patient;
            };

        return {
            map: map
        };
    }]);