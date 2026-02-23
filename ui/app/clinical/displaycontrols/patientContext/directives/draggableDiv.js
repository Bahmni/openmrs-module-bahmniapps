/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


angular.module('bahmni.clinical')
    .directive("draggableDiv", ['$document', function ($document) {
        return {
            link: function (scope, element, attr) {
                element.resizable({ handles: " n, e, s, w, ne, se, sw, nw" });
                element.on('resizestop', function () {
                    element.css({
                        position: 'fixed'
                    });
                });
                element.draggable();
            }
        };
    }]);
