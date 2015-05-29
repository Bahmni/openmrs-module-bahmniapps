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
        var dataArray = flattenObject(complexObject);
        for (var property in dataArray) {
            var fnName = "validate_" + property.replace("\.", "_");
            var exists = true;
            try {
                if (eval(fnName))
                    exists = true;
            } catch (e) {
                exists = false;
            }
            if (exists) {
                if (typeof eval(fnName).method == 'function') {
                    var ret = (eval(fnName).method)(property, dataArray[property],
                        _.filter(objectConfiguration, function (attr) {
                            return attr.name == property
                        })[0]);
                    if (ret == false) {
                        return (eval(fnName).errorMessage);
                    }
                }
            }
        }
        return;
    };
    return {
        validate: validate
    };
})();