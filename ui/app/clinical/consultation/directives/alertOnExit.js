"use strict"

angular.module('bahmni.clinical')
    .directive('alertOnExit', ['exitAlertService', '$state',
        function(exitAlertService, $state) {
            return {
                link: function($scope) {
                    $scope.$on('$stateChangeStart', function(event, next) {
                        var isNavigating = exitAlertService.setIsNavigating(next);
                        $state.dirtyConsultationForm = exitAlertService.setDirtyConsultationForm();
                        exitAlertService.showExitAlert(isNavigating, $state.dirtyConsultationForm, event, next.spinnerToken);
                    });
                }
            }
        }
    ]);
