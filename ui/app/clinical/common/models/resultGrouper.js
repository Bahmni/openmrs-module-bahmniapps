'use strict';

Bahmni.Clinical.ResultGrouper = function () {};

Bahmni.Clinical.ResultGrouper.prototype.group = function (inputArray, groupKeyFunction, nameForGroupedValue, nameForKey) {
    var result = [];
    var arrayInObjectForm = {};
    nameForKey = nameForKey || 'key';
    nameForGroupedValue = nameForGroupedValue || "values";

    inputArray.forEach(function (obj) {
        if (arrayInObjectForm[groupKeyFunction(obj)]) {
            arrayInObjectForm[groupKeyFunction(obj)].values.push(obj);
        } else {
            arrayInObjectForm[groupKeyFunction(obj)] = {values: [obj]};
        }
    });
    angular.forEach(arrayInObjectForm, function (item, key) {
        var group = {};
        group[nameForKey] = key;
        group[nameForGroupedValue] = item.values;
        result.push(group);
    });
    return result;
};
