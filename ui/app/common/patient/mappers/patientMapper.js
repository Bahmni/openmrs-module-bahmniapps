'use strict';

angular.module('bahmni.common.patient')
    .factory('patientMapper', ['$rootScope',
        function ( $rootScope) {
            var getPatientConfigByUuid = function (patientConfig,attributeUuid) {
                if(patientConfig){
                    return patientConfig.personAttributeTypes.filter(function (item) {
                        return item.uuid === attributeUuid
                    })[0];
                }

            }

            var mapAttributes = function (patient, attributes) {
                if($rootScope.patientConfig){
                    attributes.forEach(function (attribute) {
                        var x = getPatientConfigByUuid($rootScope.patientConfig,attribute.attributeType.uuid);
                        patient[x.name] = attribute.value;
                    });
                }
            };


            var mapAddress = function (preferredAddress) {
                return preferredAddress ? {
                    "address1": preferredAddress.address1,
                    "address2": preferredAddress.address2,
                    "address3": preferredAddress.address3,
                    "cityVillage": preferredAddress.cityVillage,
                    "countyDistrict": preferredAddress.countyDistrict === null ? '' : preferredAddress.countyDistrict,
                    "stateProvince": preferredAddress.stateProvince
                } : {};
            };

            var parseDate = function (dateStr) {
                if (dateStr)
                    return Bahmni.Common.Util.DateUtil.parse(dateStr.substr(0, 10));
                return dateStr;
            };

            var mapGenderText = function(genderChar) {
                if (genderChar == null ) {
                    return null;
                } else if(genderChar == 'M' || genderChar == 'm')  {
                    return "Male";
                } else if (genderChar == 'F' || genderChar == 'f') {
                    return "Female";
                } else {
                    return "Other";
                }
            }

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
                patient.genderText = mapGenderText(patient.gender);
                patient.address = mapAddress(openmrsPatient.person.preferredAddress);
                patient.identifier = openmrsPatient.identifiers[0].identifier;
                patient.image = Bahmni.Common.Constants.patientImageUrl + openmrsPatient.uuid + ".jpeg";
                patient.registrationDate = parseDate(openmrsPatient.person.personDateCreated);
                mapAttributes(patient, openmrsPatient.person.attributes);
                return patient;
            };

            var constructImageUrl = function (patientUuid) {
                return  Bahmni.Common.Constants.patientImageUrl + patientUuid + ".jpeg";
            };

            return {
                map: map,
                constructImageUrl: constructImageUrl
            }
    }]);
