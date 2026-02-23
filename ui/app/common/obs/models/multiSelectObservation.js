/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

Bahmni.Common.Obs.MultiSelectObservation = (function () {
    var MultiSelectObservation = function (groupMembers, conceptConfig) {
        this.type = "multiSelect";
        this.concept = groupMembers[0].concept;
        this.encounterDateTime = groupMembers[0].encounterDateTime;
        this.groupMembers = groupMembers;
        this.conceptConfig = conceptConfig;
        this.observationDateTime = getLatestObservationDateTime(this.groupMembers);
        this.providers = groupMembers[0].providers;
        this.creatorName = groupMembers[0].creatorName;
    };
    var getLatestObservationDateTime = function (groupMembers) {
        var latestObservationDateTime = groupMembers[0].observationDateTime;
        groupMembers.forEach(function (member) {
            latestObservationDateTime = latestObservationDateTime < member.observationDateTime ? member.observationDateTime : latestObservationDateTime;
        });
        return latestObservationDateTime;
    };

    MultiSelectObservation.prototype = {

        isFormElement: function () {
            return true;
        },

        getDisplayValue: function () {
            var getName = Bahmni.Common.Domain.ObservationValueMapper.getNameFor["Object"];
            return _.map(this.groupMembers, getName).join(", ");
        }
    };

    return MultiSelectObservation;
})();
