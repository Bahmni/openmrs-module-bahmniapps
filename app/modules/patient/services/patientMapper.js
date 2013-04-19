'use strict';

angular.module('resources.patientMapper', ['resources.patientAttributeType'])
    .factory('patientMapper', ['patientAttributeType', function (patientAttributeType) {

        var map = function(patient) {
            var image = patient.image && patient.image.indexOf('data') === 0 ? patient.image.replace("data:image/jpeg;base64,", "") : null;

            return {
                names: [{familyName: patient.familyName, givenName: patient.givenName}],
                age: patient.age,
                birthdate: patient.birthdate,
                gender: patient.gender,
                identifier: patient.identifier,
                centerID: patient.centerID,
                addresses: [patient.address],
                image: image,
                attributes: _mapAttributes(patient)
            };
        }

        var _mapAttributes = function(patient) {
            var patientAttributes = patientAttributeType.getAll();
            return patientAttributes.map(function(result) {
                return {"attributeType": result.uuid, "name": result.name, "value" : patient[result.name]}
            }).filter(function(result){return result.value != undefined});
        }

        return {
            map: map
        }
    }]);
