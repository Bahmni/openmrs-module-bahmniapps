angular.module('bahmni.clinical')
    .factory('exitAlertService', ['messagingService', 'spinner', '$state', '$location',
        function (messagingService, spinner, $state, $location) {
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
                },
                redirectUrl: function () {
                    return $state.isPatientSearch ? $location.path('/default/patient/search') : $location.path('/default/patient/' + $state.newPatientUuid + "/dashboard");
                }
            };
        }
    ]);
