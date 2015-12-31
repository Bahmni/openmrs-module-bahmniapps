'use strict';

Bahmni.Common.Domain.AttributeFormatter = (function () {

    function AttributeFormatter() {
    }

    AttributeFormatter.prototype.getMrsAttributes = function (model, attributeTypes) {
        return attributeTypes.map(function (result) {
            var attribute = {
                attributeType: {
                    uuid: result.uuid
                }
            };
            setAttributeValue(result, attribute, model[result.name]);
            return attribute
        })
    };

    AttributeFormatter.prototype.removeUnfilledAttributes = function(formattedAttributes) {
        return _.filter(formattedAttributes, function(elem){
            return elem.value !== undefined;
        });
    };
    
    function setAttributeValue(attributeType, attr, value) {
        if (value === "" || value === null || value === undefined) {
            attr.voided = true;
        }
        else if (attributeType.format === "org.openmrs.Concept") {
            attr.hydratedObject = value;
        }
        else if (attributeType.format == "org.openmrs.util.AttributableDate") {
            var mnt = moment(value);
            attr.value = mnt.format('YYYY-MM-DD');
        }
        else {
            attr.value = value.toString();
        }
    }

    return AttributeFormatter;
})();