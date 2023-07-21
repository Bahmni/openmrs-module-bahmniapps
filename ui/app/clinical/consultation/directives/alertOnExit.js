"use strict"

angular.module('bahmni.clinical')
    .directive('alertOnExit', ['messagingService', 'spinner', '$state',
        function (messagingService, spinner, $state) {
            return {
                link: function ($scope, elem, attrs) {
                    $scope. $on ('$stateChangeStart', function (event, next, current) {
                    var isNavigating = false;
                        if (next.url.includes("/patient/search")) {
                            isNavigating = true;
                        }
                        if($state.discardChanges) {
                            $state.dirtyConsultationForm = false;
                        }
                        if(isNavigating && $state.dirtyConsultationForm){
                            messagingService.showMessage('alert', "{{'ALERT_MESSAGE_ON_EXIT' | translate }}");
                            event.preventDefault();
                            spinner.hide(next.spinnerToken);
                        }
                    });
                }
            }
        }
    ]);
