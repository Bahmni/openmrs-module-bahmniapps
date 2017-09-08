'use strict';

Bahmni.Common.Domain.AttributeTypeMapper = (function () {
    function AttributeTypeMapper () {
    }

    AttributeTypeMapper.prototype.mapFromOpenmrsAttributeTypes = function (mrsAttributeTypes, mandatoryAttributes, attributesConfig) {
        var attributeTypes = [];
        angular.forEach(mrsAttributeTypes, function (mrsAttributeType) {
            var isRequired = function () {
                var element = _.find(mandatoryAttributes, function (mandatoryAttribute) {
                    return mandatoryAttribute == mrsAttributeType.name;
                });
                return element ? true : false;
            };

            var attributeType = {
                uuid: mrsAttributeType.uuid,
                sortWeight: mrsAttributeType.sortWeight,
                name: mrsAttributeType.name,
                fullySpecifiedName: mrsAttributeType.name,
                description: mrsAttributeType.description || mrsAttributeType.name,
                format: mrsAttributeType.format || mrsAttributeType.datatypeClassname,
                answers: [],
                required: isRequired(),
                concept: mrsAttributeType.concept || {},
                excludeFrom: (attributesConfig && attributesConfig[mrsAttributeType.name] && attributesConfig[mrsAttributeType.name].excludeFrom) || []
            };
            attributeType.concept.dataType = attributeType.concept.datatype && attributeType.concept.datatype.name;

            if (mrsAttributeType.concept && mrsAttributeType.concept.answers) {
                angular.forEach(mrsAttributeType.concept.answers, function (mrsAnswer) {
                    var displayName = mrsAnswer.display;
                    var fullySpecifiedName = mrsAnswer.display;
                    if (mrsAnswer.names && mrsAnswer.names.length == 2) {
                        if (mrsAnswer.name.conceptNameType == 'FULLY_SPECIFIED') {
                            if (mrsAnswer.names[0].display == displayName) {
                                displayName = mrsAnswer.names[1].display;
                                fullySpecifiedName = mrsAnswer.names[0].display;
                            } else {
                                displayName = mrsAnswer.names[0].display;
                                fullySpecifiedName = mrsAnswer.names[1].display;
                            }
                        }
                    }
                    attributeType.answers.push({
                        fullySpecifiedName: fullySpecifiedName,
                        description: displayName,
                        conceptId: mrsAnswer.uuid
                    });
                });
            }
            if (attributeType.format == "org.openmrs.customdatatype.datatype.RegexValidatedTextDatatype") {
                attributeType.pattern = mrsAttributeType.datatypeConfig;
            }

            attributeTypes.push(attributeType);
        });
        return {
            attributeTypes: attributeTypes
        };
    };

    return AttributeTypeMapper;
})();
