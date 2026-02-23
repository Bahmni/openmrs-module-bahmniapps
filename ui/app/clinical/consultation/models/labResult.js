/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

Bahmni.Clinical.LabResult = function (name, value, alert, lowNormal, highNormal, unit, notes, members) {
    this.name = name;
    this.value = value;
    this.alert = alert;
    this.unit = unit;
    this.highNormal = highNormal;
    this.lowNormal = lowNormal;
    this.notes = notes || [];
    this.members = members;
};

Bahmni.Clinical.LabResult.prototype = {
    isPanel: function () {
        return this.members.length > 0;
    },

    hasNotes: function () {
        return this.notes.length > 0;
    },

    isAbnormal: function () {
        return this.alert === "A" || this.alert === "B";
    },

    range: function () {
        return (this.lowNormal && this.highNormal) ? "" + this.lowNormal + " - " + this.highNormal : null;
    }
};
