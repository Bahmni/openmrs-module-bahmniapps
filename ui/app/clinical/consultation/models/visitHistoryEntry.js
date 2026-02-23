/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

Bahmni.Clinical.VisitHistoryEntry = (function () {
    var VisitHistoryEntry = function (visitData) {
        angular.extend(this, visitData);
    };

    VisitHistoryEntry.prototype = {
        isActive: function () {
            return this.stopDatetime === null;
        },

        isIPDVisit: function () {
            return (this.visitType.name || this.visitType.display) === "IPD";
        },

        isFromCurrentLocation: function (currentVisitLocation) {
            var visitLocation = _.get(this.location, 'uuid');
            return visitLocation === currentVisitLocation;
        },

        isOneDayVisit: function () {
            if (this.isActive()) {
                return true;
            }
            var startDateString = moment(this.startDatetime).format("YYYYMMDD");
            var stopDateString = moment(this.stopDatetime).format("YYYYMMDD");
            return startDateString === stopDateString;
        },

        getVisitType: function () {
            if (this.visitType) {
                return this.visitType.name || this.visitType.display;
            }
        }
    };

    return VisitHistoryEntry;
})();

