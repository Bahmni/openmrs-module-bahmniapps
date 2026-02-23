/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

angular.module('bahmni.common.displaycontrol.diagnosis')
.filter('primaryDiagnosisFirst', function () {
    return function (diagnoses) {
        var primaryDiagnoses = _.filter(diagnoses, function (diagnosis) { return diagnosis.isPrimary(); });
        var otherDiagnoses = _.filter(diagnoses, function (diagnosis) { return !diagnosis.isPrimary(); });
        return primaryDiagnoses.concat(otherDiagnoses);
    };
});
