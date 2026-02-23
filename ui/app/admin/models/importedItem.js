/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

Bahmni.Admin.ImportedItem = function (data) {
    angular.extend(this, data);
    // TODO: Make this configurable
    this.baseUrl = '/uploaded-files/mrs';
};

Bahmni.Admin.ImportedItem.prototype = {
    hasError: function () {
        return this.failedRecords > 0;
    },

    errorFileUrl: function () {
        return this.baseUrl + '/' + this.errorFileName;
    }
};
