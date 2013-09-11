'use strict';

angular.module('bahmni.common.patient.mappers')
    .factory('patientMapper', ['$rootScope',
        function ( $rootScope) {
            var getPatientConfigByUuid = function (patientConfig,attributeUuid) {
                return patientConfig.personAttributeTypes.filter(function (item) {
                    return item.uuid === attributeUuid
                })[0];
            }

            var mapAttributes = function (patient, attributes) {
                attributes.forEach(function (attribute) {
                    var x = getPatientConfigByUuid($rootScope.patientConfig,attribute.attributeType.uuid);
                    patient[x.name] = attribute.value;
                });
            };


            var mapAddress = function (preferredAddress) {
                return preferredAddress ? {
                    "address1": preferredAddress.address1,
                    "address2": preferredAddress.address2,
                    "address3": preferredAddress.address3,
                    "cityVillage": preferredAddress.cityVillage,
                    "countyDistrict": preferredAddress.countyDistrict,
                    "stateProvince": preferredAddress.stateProvince
                } : {};
            };

            var parseDate = function (dateStr) {
                if (dateStr)
                    return new Date(dateStr.substr(0, 10));
                return dateStr;
            };

            var map = function (openmrsPatient) {
                var patient = {};
                var birthdate = parseDate(openmrsPatient.person.birthdate);
                patient.uuid = openmrsPatient.uuid;
                patient.givenName = openmrsPatient.person.preferredName.givenName;
                patient.familyName = openmrsPatient.person.preferredName.familyName;
                patient.name = patient.givenName + ' ' + patient.familyName; 
                patient.birthdate = birthdate;
                patient.age =  openmrsPatient.person.age;
                patient.gender = openmrsPatient.person.gender;
                patient.address = mapAddress(openmrsPatient.person.preferredAddress);
                patient.identifier = openmrsPatient.identifiers[0].identifier;
                patient.image = $rootScope.bahmniConfiguration.patientImagesUrl + "/" + patient.identifier + ".jpeg" + "?q=" + new Date().getTime();
                patient.registrationDate = parseDate(openmrsPatient.person.personDateCreated);
                mapAttributes(patient, openmrsPatient.person.attributes);
                return patient;
            };

            var constructImageUrl = function (identifier) {
                return $rootScope.bahmniConfiguration.patientImagesUrl + "/" + identifier + ".jpeg";
            }

            return {
                map: map,
                constructImageUrl: constructImageUrl
            }
    }]);
