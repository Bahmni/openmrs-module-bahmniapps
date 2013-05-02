'use strict';

angular.module('resources.openmrsPatientMapper', ['resources.patientAttributeType', 'resources.patient'])
    .factory('openmrsPatientMapper',['patientAttributeType', 'patient', '$rootScope', function (patientAttributeType, patientModel, $rootScope) {

        var mapAttributes = function (patient, attributes) {
            attributes.forEach(function(attribute) {
                var x = patientAttributeType.get(attribute.attributeType.uuid);
                patient[x.name] = attribute.value;
            });
        };


        var pad = function(number) {
            return number > 9 ? number.toString() : "0" + number.toString();
        };


        var parseDate = function(dateStr){
            if(dateStr)
                return new Date(dateStr.substr(0,10));
            return dateStr;
        };

        var getBirthDate = function(openmrsPatient) {
            if (openmrsPatient.person.birthdateEstimated || !openmrsPatient.person.birthdate) return "";
            var date = parseDate(openmrsPatient.person.birthdate);
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
            var patient = patientModel.create();
            patient.givenName = openmrsPatient.person.preferredName.givenName;
            patient.familyName = openmrsPatient.person.preferredName.familyName;
            patient.birthdate = getBirthDate(openmrsPatient);
            patient.age = openmrsPatient.person.age;
            patient.gender = openmrsPatient.person.gender;
            patient.address = mapAddress(openmrsPatient.person.preferredAddress);
            patient.identifier = openmrsPatient.identifiers[0].identifier;
            patient.image = $rootScope.bahmniConfiguration.patientImagesUrl +  "/" + patient.identifier + ".jpeg" + "?q=" + new Date().getTime();
            patient.registrationDate = parseDate(openmrsPatient.person.personDateCreated);
            mapAttributes(patient, openmrsPatient.person.attributes);
            return patient;
        };

        return {
            map: map
        }
    }]);