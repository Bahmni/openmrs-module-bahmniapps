/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

angular.module('bahmni.common.domain')
    .service('retrospectiveEntryService', ['$rootScope', '$bahmniCookieStore', function ($rootScope, $bahmniCookieStore) {
        var retrospectiveEntryService = this;
        var dateUtil = Bahmni.Common.Util.DateUtil;

        this.getRetrospectiveEntry = function () {
            return $rootScope.retrospectiveEntry;
        };

        this.isRetrospectiveMode = function () {
            return !_.isEmpty(retrospectiveEntryService.getRetrospectiveEntry());
        };

        this.getRetrospectiveDate = function () {
            return $rootScope.retrospectiveEntry && $rootScope.retrospectiveEntry.encounterDate;
        };

        this.initializeRetrospectiveEntry = function () {
            var retrospectiveEncounterDateCookie = $bahmniCookieStore.get(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName);
            if (retrospectiveEncounterDateCookie) {
                $rootScope.retrospectiveEntry = Bahmni.Common.Domain.RetrospectiveEntry.createFrom(dateUtil.getDate(retrospectiveEncounterDateCookie));
            }
        };

        this.resetRetrospectiveEntry = function (date) {
            $bahmniCookieStore.remove(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName, {path: '/', expires: 1});
            $rootScope.retrospectiveEntry = undefined;

            if (date && !dateUtil.isSameDate(date, dateUtil.today())) {
                $rootScope.retrospectiveEntry = Bahmni.Common.Domain.RetrospectiveEntry.createFrom(dateUtil.getDate(date));
                $bahmniCookieStore.put(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName, date, {path: '/', expires: 1});
            }
        };
    }]
);
