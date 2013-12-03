'use strict';

var PatientAttributeTypeMapper = (function () {

    function PatientAttributeTypeMapper() {
    }

    PatientAttributeTypeMapper.prototype.mapFromOpenmrsPatientAttributeTypes = function (mrspatientAttributeTypes) {
        var patientAttributeTypes = [];
        $.each(mrspatientAttributeTypes, function(index, mrsAttributeType) {
            var attributeType = {
                uuid: mrsAttributeType.uuid,
                sortWeight: mrsAttributeType.sortWeight,
                name: mrsAttributeType.name,
                description: mrsAttributeType.description,
                format: mrsAttributeType.format,
                answers: []
            };
            if (mrsAttributeType.concept && mrsAttributeType.concept.answers) {
                $.each(mrsAttributeType.concept.answers, function(index, mrsAnswer) {
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
