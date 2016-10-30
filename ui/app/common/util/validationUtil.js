'use strict';

Bahmni.Common.Util.ValidationUtil = (function () {
    var isAcceptableType = function (propertyToCheck) {
        return _.includes(["string", "boolean", "number", "object"], typeof propertyToCheck);
    };

    var flattenObject = function (ob) {
        var toReturn = {};
        for (var i in ob) {
            if (!ob.hasOwnProperty(i) || !isAcceptableType(ob[i])) {
                continue;
            }
            if ((typeof ob[i]) == 'object' && !(ob[i] instanceof Date)) {
                var flatObject = flattenObject(ob[i]);
                for (var x in flatObject) {
                    if (!flatObject.hasOwnProperty(x) || !isAcceptableType(flatObject[x])) {
                        continue;
                    }
                    toReturn[i + '.' + x] = flatObject[x];
                }
            } else {
                toReturn[i] = ob[i];
            }
        }
        return toReturn;
    };

    // This will work only for patient attributes, since we are passing concept behind the attribute.
    // To have a generic one, we need to remove the concept dependency.. And concept will be null for non concept fields
    var validate = function (complexObject, objectConfiguration) {
        var allCustomValidators = Bahmni.Registration.customValidator;
        if (!allCustomValidators) {
            return [];
        }

        var dataArray = flattenObject(complexObject);
        var errorMessages = [];
        _.every(dataArray, function (value, field) {
            var isValid = true;
            var fieldSpecificValidator = allCustomValidators[field];
            if (!fieldSpecificValidator) {
                return isValid;
            }
            if (typeof fieldSpecificValidator.method == 'function' && value) {
                var personAttributeTypeConfig = _.find(objectConfiguration, {name: field});
                isValid = fieldSpecificValidator.method(field, value, personAttributeTypeConfig);
                if (!isValid) {
                    errorMessages.push(fieldSpecificValidator.errorMessage);
                    isValid = true;
                }
            }
            return isValid;
        });
        return errorMessages;
    };
    return {
        validate: validate
    };
})();
