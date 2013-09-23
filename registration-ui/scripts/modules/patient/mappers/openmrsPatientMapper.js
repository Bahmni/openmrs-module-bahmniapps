'use strict';

angular.module('registration.patient.mappers').factory('openmrsPatientMapper', ['patient', '$rootScope', 'age',
    function (patientModel, $rootScope, age) {
        var mapAttributes = function (patient, attributes) {
            attributes.forEach(function (attribute) {
                var x = $rootScope.patientConfiguration.get(attribute.attributeType.uuid);
                patient[x.name] = attribute.value;
            });
        };


        var pad = function (number) {
            return number > 9 ? number.toString() : "0" + number.toString();
        };


        var parseDate = function (dateStr) {
            if (dateStr)
                return new Date(dateStr.substr(0, 10));
            return dateStr;
        };

        var getDateStr = function (date) {
            return date ? pad(date.getDate()) + "-" + pad(date.getMonth() + 1) + "-" + date.getFullYear() : "";
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

        var map = function (openmrsPatient) {
            var patient = patientModel.create();
            var birthdate = parseDate(openmrsPatient.person.birthdate);
            patient.givenName = openmrsPatient.person.preferredName.givenName;
            patient.familyName = openmrsPatient.person.preferredName.familyName;
            patient.birthdate = openmrsPatient.person.birthdateEstimated || !birthdate ? "" : getDateStr(birthdate);
            patient.age = birthdate ? age.fromBirthDate(parseDate(openmrsPatient.person.birthdate)) : null;
            patient.gender = openmrsPatient.person.gender;
            patient.address = mapAddress(openmrsPatient.person.preferredAddress);
            patient.identifier = openmrsPatient.identifiers[0].identifier;
            patient.image = $rootScope.bahmniConfiguration.patientImagesUrl + "/" + patient.identifier + ".jpeg" + "?q=" + new Date().getTime();
            patient.registrationDate = parseDate(openmrsPatient.person.personDateCreated);
            mapAttributes(patient, openmrsPatient.person.attributes);
            return patient;
        };

        return {
            map: map
        }
    }]);