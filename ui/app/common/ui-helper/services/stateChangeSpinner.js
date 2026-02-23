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
    .service('stateChangeSpinner', ['$rootScope', 'spinner', function ($rootScope, spinner) {
        var showSpinner = function (event, toState) { toState.spinnerToken = spinner.show(); };
        var hideSpinner = function (event, toState) { spinner.hide(toState.spinnerToken); };

        this.activate = function () {
            $rootScope.$on('$stateChangeStart', showSpinner);
            $rootScope.$on('$stateChangeSuccess', hideSpinner);
            $rootScope.$on('$stateChangeError', hideSpinner);
        };
    }]);
