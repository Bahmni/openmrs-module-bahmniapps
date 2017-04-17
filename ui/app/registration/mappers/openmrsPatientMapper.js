'use strict';

angular.module('bahmni.registration').factory('openmrsPatientMapper', ['patient', '$rootScope', 'age', 'identifiers',
    function (patient, $rootScope, age, identifiers) {
        var patientModel = patient;
        var whereAttributeTypeExists = function (attribute) {
                return $rootScope.patientConfiguration.get(attribute.attributeType.uuid);
            },
            addAttributeToPatient = function (patient, attribute) {
                var attributeType = $rootScope.patientConfiguration.get(attribute.attributeType.uuid);
                if (attributeType) {
                    if (attributeType.format === "org.openmrs.Concept" && attribute.value) {
                        patient[attributeType.name] = {conceptUuid: attribute.value.uuid, value: attribute.value.display};
                    } else if (attributeType.format === "org.openmrs.util.AttributableDate") {
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
            mapRelationships = function (patient, relationships) {
                patient.relationships = relationships || [];
                patient.newlyAddedRelationships = [{}];
                patient.hasRelationships = patient.relationships.length > 0;
            },

            map = function (openmrsPatient) {
                var relationships = openmrsPatient.relationships;
                openmrsPatient = openmrsPatient.patient;
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
                patient.image = Bahmni.Registration.Constants.patientImageUrlByPatientUuid + openmrsPatient.uuid + "&q=" + new Date().toISOString();
                patient.registrationDate = Bahmni.Common.Util.DateUtil.parse(openmrsPerson.auditInfo.dateCreated);
                patient.dead = openmrsPerson.dead;
                patient.isDead = patient.dead;
                patient.deathDate = parseDate(openmrsPerson.deathDate);
                patient.causeOfDeath = openmrsPerson.causeOfDeath;
                patient.birthdateEstimated = openmrsPerson.birthdateEstimated;
                patient.bloodGroup = openmrsPerson.bloodGroup;
                mapAttributes(patient, openmrsPerson.attributes);
                mapRelationships(patient, relationships);
                _.assign(patient, identifiers.mapIdentifiers(openmrsPatient.identifiers));

                return patient;
            };

        return {
            map: map
        };
    }]);
