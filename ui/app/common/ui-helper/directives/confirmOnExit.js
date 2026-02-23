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
    .directive('confirmOnExit', ['$translate', function ($translate) {
        return {
            link: function ($scope) {
                var cleanUpListenerPageUnload = $scope.$on("event:pageUnload", function () {
                    window.onbeforeunload = function () {
                        return $translate.instant("BROWSER_CLOSE_DIALOG_MESSAGE_KEY");
                    };
                });

                $scope.$on("$destroy", cleanUpListenerPageUnload);
            }
        };
    }]);
