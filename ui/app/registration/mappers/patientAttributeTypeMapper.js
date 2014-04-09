'use strict';

Bahmni.Registration.PatientAttributeTypeMapper = (function () {

    function PatientAttributeTypeMapper() {
    }

    PatientAttributeTypeMapper.prototype.mapFromOpenmrsPatientAttributeTypes = function (mrspatientAttributeTypes) {
        var patientAttributeTypes = [];
        angular.forEach(mrspatientAttributeTypes, function(mrsAttributeType) {
            var attributeType = {
                uuid: mrsAttributeType.uuid,
                sortWeight: mrsAttributeType.sortWeight,
                name: mrsAttributeType.name,
                description: mrsAttributeType.description,
                format: mrsAttributeType.format,
                answers: []
            };
            if (mrsAttributeType.concept && mrsAttributeType.concept.answers) {
                angular.forEach(mrsAttributeType.concept.answers, function(mrsAnswer) {
                    attributeType.answers.push({
                        description: mrsAnswer.display,
                        conceptId: mrsAnswer.uuid
                    });
                });
            }
            patientAttributeTypes.push(attributeType);
        });
        return {
            personAttributeTypes : patientAttributeTypes
        };
    };

    return PatientAttributeTypeMapper;
})();
