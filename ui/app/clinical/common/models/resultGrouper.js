/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


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
