'use strict';

Bahmni.Common.Domain.AttributeTypeMapper = (function () {
    function AttributeTypeMapper () {
    }

    AttributeTypeMapper.prototype.mapFromOpenmrsAttributeTypes = function (mrsAttributeTypes, mandatoryAttributes, attributesConfig, defaultLocale) {
        var attributeTypes = [];
        angular.forEach(mrsAttributeTypes, function (mrsAttributeType) {
            var isRequired = function () {
                var element = _.find(mandatoryAttributes, function (mandatoryAttribute) {
                    return mandatoryAttribute == mrsAttributeType.name;
                });
                return element ? true : false;
            };

            var getLocaleSpecificConceptName = function (concept, locale, conceptNameType) {
                conceptNameType = conceptNameType ? conceptNameType : "SHORT";
                var localeSpecificName = _.filter(concept.names, function (name) {
                    return name.locale == locale && name.conceptNameType == conceptNameType;
                });
                if (localeSpecificName && localeSpecificName[0]) {
                    return localeSpecificName[0].display;
                }
                return null;
            };

            var getConceptDisplayName = function (concept, locale) {
                var conceptNames = concept.names || [];
                var shortName = conceptNames.find(function (cn) {
                    return cn.locale === locale && cn.conceptNameType === "SHORT";
                });
                if (shortName) {
                    return shortName.name;
                }
                var fsName = conceptNames.find(function (cn) {
                    return cn.locale === locale && cn.conceptNameType === "FULLY_SPECIFIED";
                });
                if (fsName) {
                    return fsName.name;
                }
                return concept.name ? concept.name.display : concept.displayString;
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
                    var displayName = getConceptDisplayName(mrsAnswer, defaultLocale);
                    var fullySpecifiedName = getLocaleSpecificConceptName(mrsAnswer, defaultLocale, "FULLY_SPECIFIED");
                    fullySpecifiedName = fullySpecifiedName || mrsAnswer.name.display;

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
