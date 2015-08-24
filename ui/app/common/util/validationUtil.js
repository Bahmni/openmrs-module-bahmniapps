'use strict';

Bahmni.Common.Util.ValidationUtil = (function () {

    var isAcceptableType = function (propertyToCheck) {
        return _.contains(["string", "boolean", "number", "object"], typeof propertyToCheck);
    };

    var flattenObject = function (ob) {
        var toReturn = {};
        for (var i in ob) {
            if (!ob.hasOwnProperty(i) || !isAcceptableType(ob[i])) {
                continue;
            }
            if ((typeof ob[i]) == 'object') {
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

    //This will work only for patient attributes, since we are passing concept behind the attribute.
    //To have a generic one, we need to remove the concept dependency.. And concept will be null for non concept fields
    var validate = function (complexObject, objectConfiguration) {
        var allCustomValidators;
        var dataArray = flattenObject(complexObject);
        var errorMessage = '';
        try{
            allCustomValidators = eval("customValidator");
        } catch (e){}
        if(!allCustomValidators) return errorMessage;
        _.every(dataArray,function(value,field){
            var isValid=true;
            var fieldSpecificValidator = allCustomValidators[field];
            if (!fieldSpecificValidator) return isValid;
            if (typeof fieldSpecificValidator.method == 'function') {
                var personAttributeTypeConfig = _.find(objectConfiguration,{name:field});
                isValid = fieldSpecificValidator.method(field, value, personAttributeTypeConfig);
                if (!isValid){
                    errorMessage += fieldSpecificValidator.errorMessage + ", ";
                    isValid = true;
                }
            }
            return isValid;
        });
        errorMessage = errorMessage.substr(0, errorMessage.length-2);
        return errorMessage;
    };
    return {
        validate: validate
    };
})();