/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

Bahmni.ConceptSet.SpecimenTypeObservation = function (observation, allSamples) {
    angular.extend(this, observation);
    this.allSamples = allSamples;

    this.getPossibleAnswers = function () {
        return this.allSamples;
    };

    this.hasValueOf = function (answer) {
        return observation.type && observation.type.uuid === answer.uuid;
    };

    this.toggleSelection = function (answer) {
        if (this.hasValueOf(answer)) {
            observation.type = null;
        } else {
            observation.type = answer;
        }
    };
};
