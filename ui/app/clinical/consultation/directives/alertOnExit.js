"use strict"

angular.module('bahmni.clinical')
    .directive('alertOnExit', ['messagingService', 'spinner', '$state',
        function (messagingService, spinner, $state) {
            return {
                link: function ($scope, elem, attrs) {
                    $scope. $on ('$stateChangeStart', function (event, next, current) {
                    var isNavigating = false;
                        if (next.url.split("/")[3] === 'search') {
                            isNavigating = true;
                        }
                        
                        if(isNavigating && $state.dirtyConsultationForm){
                            messagingService.showMessage('error', "{{'ALERT_MESSAGE_ON_EXIT' | translate }}");
                            event.preventDefault () ;
                            spinner.hide(next.spinnerToken);
                        }
                    });
                }
            }
        }
    ]);
