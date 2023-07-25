angular.module('bahmni.clinical')
    .factory('exitAlertService', ['messagingService', 'spinner', '$state', function (messagingService, spinner, $state) {
        return {
            showExitAlert: function (isNavigating, dirtyConsultationForm, event, spinnerToken) {
                if (isNavigating && dirtyConsultationForm) {
                    messagingService.showMessage('alert', "{{'ALERT_MESSAGE_ON_EXIT' | translate }}");
                    event.preventDefault();
                    spinner.hide(spinnerToken);
                }
            },
            setIsNavigating: function (next) {
                return next.url.includes("/patient/search");
            },
            setDirtyConsultationForm: function () {
                return $state.discardChanges ? false : $state.dirtyConsultationForm;
            }
        };
    }]);
