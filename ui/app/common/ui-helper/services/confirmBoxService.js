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
    .service('confirmBox', ['$rootScope', 'ngDialog', function ($rootScope, ngDialog) {
        var dialog;
        var confirmBox = function (config) {
            var confirmBoxScope = $rootScope.$new();
            confirmBoxScope.close = function () {
                ngDialog.close(dialog.id);
                confirmBoxScope.$destroy();
            };
            confirmBoxScope.scope = config.scope;
            confirmBoxScope.actions = config.actions;
            dialog = ngDialog.open({
                template: '../common/ui-helper/views/confirmBox.html',
                scope: confirmBoxScope,
                className: config.className || 'ngdialog-theme-default'
            });
        };
        return confirmBox;
    }]);
