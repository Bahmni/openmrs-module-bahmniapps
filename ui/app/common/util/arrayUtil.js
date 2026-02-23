/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

Bahmni.Common.Util.ArrayUtil = {
    chunk: function (array, chunkSize) {
        var chunks = [];
        for (var i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    },

    groupByPreservingOrder: function (records, groupingFunction, keyName, valueName) {
        var groups = [];
        records.forEach(function (record) {
            var recordKey = groupingFunction(record);
            var existingGroup = _.find(groups, function (group) { return group[keyName] === recordKey; });
            if (existingGroup) {
                existingGroup[valueName].push(record);
            } else {
                var newGroup = {};
                newGroup[keyName] = recordKey;
                newGroup[valueName] = [record];
                groups.push(newGroup);
            }
        });
        return groups;
    }
};
