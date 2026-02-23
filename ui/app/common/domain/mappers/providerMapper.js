/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

Bahmni.Common.Domain.ProviderMapper = function () {
    this.map = function (openMrsProvider) {
        if (!openMrsProvider) {
            return null;
        }
        return {
            uuid: openMrsProvider.uuid,
            name: openMrsProvider.preferredName ? openMrsProvider.preferredName.display : openMrsProvider.person.preferredName.display
        };
    };
};
