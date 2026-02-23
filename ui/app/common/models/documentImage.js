/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

Bahmni.Common.DocumentImage = function (data) {
    angular.extend(this, data);
    this.title = this.getTitle();
    this.thumbnail = this.getThumbnail();
};

Bahmni.Common.DocumentImage.prototype = {
    getTitle: function () {
        var titleComponents = [];
        if (this.concept) {
            titleComponents.push(this.concept.name);
        }
        if (this.obsDatetime) {
            titleComponents.push(moment(this.obsDatetime).format(Bahmni.Common.Constants.dateDisplayFormat));
        }
        return titleComponents.join(', ');
    },

    getThumbnail: function () {
        var src = this.src || this.encodedValue;
        return src && src.replace(/(.*)\.(.*)$/, "$1_thumbnail.$2") || null;
    }
};
