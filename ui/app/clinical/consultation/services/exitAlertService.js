/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

angular.module('bahmni.clinical')
    .factory('exitAlertService', ['messagingService', 'spinner', '$state',
        function (messagingService, spinner, $state) {
            return {
                showExitAlert: function (isNavigating, dirtyConsultationForm, event, spinnerToken) {
                    if (isNavigating && dirtyConsultationForm) {
                        messagingService.showMessage('alert', "{{'ALERT_MESSAGE_ON_EXIT' | translate }}");
                        $state.reviewButtonFocused = true;
                        event.preventDefault();
                        spinner.hide(spinnerToken);
                    }
                },
                setIsNavigating: function (next, uuid, currentUuid) {
                    $state.newPatientUuid = currentUuid;
                    next.url.includes("/patient/search") ? $state.isPatientSearch = true : $state.isPatientSearch = false;
                    return (next.url.includes("/patient/search") || (uuid !== currentUuid));
                }
            };
        }
    ]);
