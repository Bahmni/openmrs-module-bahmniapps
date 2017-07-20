'use strict';

Bahmni.Common.Domain.AttributeFormatter = (function () {
    function AttributeFormatter () {
    }

    AttributeFormatter.prototype.getMrsAttributes = function (model, attributeTypes) {
        return attributeTypes.map(function (result) {
            var attribute = {
                attributeType: {
                    uuid: result.uuid
                }
            };
            if (!_.isEmpty(model)) {
                setAttributeValue(result, attribute, model[result.name]);
            }
            return attribute;
        });
    };

    AttributeFormatter.prototype.getMrsAttributesForUpdate = function (model, attributeTypes, attributes) {
        return _.filter(AttributeFormatter.prototype.getMrsAttributes(model, attributeTypes), function (mrsAttribute) {
            var attribute = _.find(attributes, function (attribute) {
                return mrsAttribute.attributeType.uuid === attribute.attributeType.uuid;
            });
            if (attribute && !attribute.voided) {
                mrsAttribute.uuid = attribute.uuid;
            }
            return isAttributeChanged(mrsAttribute);
        });
    };

    AttributeFormatter.prototype.removeUnfilledAttributes = function (formattedAttributes) {
        return _.filter(formattedAttributes, isAttributeChanged);
    };

    var isAttributeChanged = function (attribute) {
        return attribute.value || attribute.uuid;
    };

    var setAttributeValue = function setAttributeValue (attributeType, attr, value) {
        if (value === "" || value === null || value === undefined || value.conceptUuid === null) {
            attr.voided = true;
        } else if (attributeType.format === "org.openmrs.Concept") {
            var attrDescription = _.find(attributeType.answers, function (answer) {
                if (answer.conceptId === value.conceptUuid) {
                    return true;
                }
            });
            attr.value = attrDescription != undefined ? attrDescription.description : null;
            attr.hydratedObject = value.conceptUuid;
        } else if (attributeType.format == "org.openmrs.util.AttributableDate" || attributeType.format == "org.openmrs.customdatatype.datatype.DateDatatype") {
            var mnt = moment(value);
            attr.value = mnt.format('YYYY-MM-DD');
        } else {
            attr.value = value.toString();
        }
    };

    return AttributeFormatter;
})();
