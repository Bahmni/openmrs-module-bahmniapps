'use strict';

angular.module('resources.patientMapper', ['resources.patientAttributeType'])
    .factory('patientMapper', ['patientAttributeType', function (patientAttributeType) {
        var patientAttributes = [];

        var cachePatientAttribute = function() {
            if(patientAttributes.length > 0)
                return;

            patientAttributeType.getAll().success(function(data){
                patientAttributes = data.results;
            });
        };

        var map = function(patient) {
            cachePatientAttribute()
            return {
                names: [{familyName: patient.familyName, givenName: patient.givenName}],
                age: patient.age,
                birthdate: patient.birthdate,
                gender: patient.gender,
                patientIdentifier: patient.patientIdentifier,
                centerID: patient.centerID,
                addresses: [patient.address],
                attributes: _mapAttributes(patient)
            };
        }

        var _mapAttributes = function(patient) {
            return patientAttributes.map(function(result) {
                return {"attributeType": result.uuid, "name": result.name, "value" : patient[result.name]}
            }).filter(function(result){return result.value != undefined});
        }

        return {
            map: map
        }
    }]);
