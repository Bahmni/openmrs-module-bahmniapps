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
