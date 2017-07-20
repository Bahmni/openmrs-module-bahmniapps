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
