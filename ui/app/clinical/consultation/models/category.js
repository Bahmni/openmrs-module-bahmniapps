/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

Bahmni.Clinical.Category = function (name, tests) {
    this.name = name;
    this.tests = tests;
    this.filteredTests = tests;

    this.filter = function (filterFunction) {
        this.filteredTests = tests.filter(filterFunction);
    };

    this.hasTests = function () {
        return this.filteredTests.length > 0;
    };
};
