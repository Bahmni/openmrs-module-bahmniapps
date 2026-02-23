/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('providerDirective', function () {
        var template = '<span>' +
                '<span ng-if=":: creatorName && providerName && (creatorName != providerName)">{{::creatorName}} {{"ON_BEHALF_OF_TRANSLATION_KEY"|translate}} </span>' +
                '{{::providerName}} <span ng-if=":: providerDate"> {{::providerDate | bahmniTime}} </span>' +
            '</span>';

        return {
            restrict: 'EA',
            replace: true,
            scope: {
                creatorName: "@",
                providerName: "@",
                providerDate: "=?"
            },
            template: template
        };
    });
