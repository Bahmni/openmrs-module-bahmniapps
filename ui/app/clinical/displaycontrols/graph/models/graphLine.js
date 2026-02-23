/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

(function () {
    Bahmni = Bahmni || {};
    Bahmni.Clinical = Bahmni.Clinical || {};

    Bahmni.Clinical.ObservationGraphLine = function (proto) {
        angular.extend(this, proto);
    };

    Bahmni.Clinical.ObservationGraphLine.prototype.addPoint = function (point) {
        if (point[this.name]) {
            this.values.push(point);
        }
    };
})();
