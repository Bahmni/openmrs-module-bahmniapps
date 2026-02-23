/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';
angular.module('bahmni.clinical')
    .controller('EditObservationFormController', ['$scope', 'appService', '$window', '$rootScope', '$translate',
        function ($scope, appService, $window, $rootScope, $translate) {
            var configForPrompting = appService.getAppDescriptor().getConfigValue('showSaveConfirmDialog');
            $scope.directivePreCloseCallback = function () {
                $scope.resetContextChangeHandler();
                if (configForPrompting && $scope.shouldPromptBeforeClose) {
                    if ($window.confirm($translate.instant("POP_UP_CLOSE_DIALOG_MESSAGE_KEY"))) {
                        if (!$rootScope.hasVisitedConsultation) {
                            $scope.shouldPromptBrowserReload = false;
                        }
                        return true;
                    }
                    return false;
                }
            };
            window.onbeforeunload = function () {
                if (configForPrompting && $scope.shouldPromptBrowserReload) {
                    return $translate.instant("BROWSER_CLOSE_DIALOG_MESSAGE_KEY");
                }
            };
        }]);
