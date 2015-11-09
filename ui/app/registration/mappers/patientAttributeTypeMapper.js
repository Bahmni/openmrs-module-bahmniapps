'use strict';

Bahmni.Registration.PatientAttributeTypeMapper = (function () {

    function PatientAttributeTypeMapper() {
    }

    PatientAttributeTypeMapper.prototype.mapFromOpenmrsPatientAttributeTypes = function (mrspatientAttributeTypes, mandatoryPersonAttributes) {
        var patientAttributeTypes = [];
        angular.forEach(mrspatientAttributeTypes, function(mrsAttributeType) {

            var isRequired = function(){
                var element = _.find(mandatoryPersonAttributes, function (mandatoryPersonAttribute) {
                    return mandatoryPersonAttribute == mrsAttributeType.name
                });
                return element ? true : false;
            };

            var attributeType = {
                uuid: mrsAttributeType.uuid,
                sortWeight: mrsAttributeType.sortWeight,
                name: mrsAttributeType.name,
                description: mrsAttributeType.description,
                format: mrsAttributeType.format,
                answers: [],
                required: isRequired()
            };
            if (mrsAttributeType.concept && mrsAttributeType.concept.answers) {
                angular.forEach(mrsAttributeType.concept.answers, function(mrsAnswer) {
                    var displayName = mrsAnswer.display;
                    if (mrsAnswer.names && mrsAnswer.names.length == 2) {
                        if (mrsAnswer.name.conceptNameType == 'FULLY_SPECIFIED') {
                            if (mrsAnswer.names[0].display == displayName)
                                displayName = mrsAnswer.names[1].display;
                            else
                                displayName = mrsAnswer.names[0].display;
                        }
                    }
                    attributeType.answers.push({
                        description: displayName,
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
