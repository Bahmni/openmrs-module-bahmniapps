'use strict';

angular.module('resources.openmrsPatientMapper', ['resources.patientAttributeType'])
    .factory('openmrsPatientMapper',['patientAttributeType', function (patientAttributeType) {

        var mapAttributes = function (patient, attributes) {
            attributes.forEach(function(attribute) {
                var x = patientAttributeType.get(attribute.attributeType.uuid);
                patient[x.name] = attribute.value;
            });
        };


        var pad = function(number) {
            return number > 9 ? number.toString() : "0" + number.toString();
        };

        var getBirthDate = function(openmrsPatient) {
            var date= new Date(openmrsPatient.person.birthdate.substr(0,10));
            if (openmrsPatient.person.birthdateEstimated) return "";
            return pad(date.getDate())+"-"+ pad(date.getMonth() + 1)+"-"+date.getFullYear();
        };

        var mapAddress = function(preferredAddress) {
            return preferredAddress ? {
                "address1": preferredAddress.address1,
                "address2": preferredAddress.address2,
                "address3": preferredAddress.address3,
                "cityVillage": preferredAddress.cityVillage,
                "countyDistrict": preferredAddress.countyDistrict,
                "stateProvince": preferredAddress.stateProvince
            } : {};
        };

        var map = function (openmrsPatient) {
            var patient =  {
                "givenName": openmrsPatient.person.preferredName.givenName,
                "familyName": openmrsPatient.person.preferredName.familyName,
                "age": openmrsPatient.person.age,
                "birthdate": getBirthDate(openmrsPatient),
                "gender": openmrsPatient.person.gender,
                "patientIdentifier": openmrsPatient.identifiers[0].identifier,
                "address": mapAddress(openmrsPatient.person.preferredAddress)
            };
            patient.image = "/patient_images/" + patient.patientIdentifier + ".jpeg";

            patientAttributeType.initialization.success(function() {
                mapAttributes(patient, openmrsPatient.person.attributes);
            });
            return patient;
        };

        return {
            map: map
        }
    }]);