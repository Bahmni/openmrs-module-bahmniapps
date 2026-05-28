/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

"use strict";

angular.module('bahmni.clinical')
    .directive('alertOnExit', ['exitAlertService', '$state',
        function (exitAlertService, $state) {
            return {
                link: function ($scope) {
                    $scope.$on('$stateChangeStart', function (event, next, current) {
                        var uuid = $state.params.patientUuid;
                        var currentUuid = current.patientUuid;
                        var isNavigating = exitAlertService.setIsNavigating(next, uuid, currentUuid);
                        $state.dirtyConsultationForm = $state.discardChanges ? false : $state.dirtyConsultationForm;
                        exitAlertService.showExitAlert(isNavigating, $state.dirtyConsultationForm, event, next.spinnerToken);
                    });
                }
            };
        }
    ]);
