'use strict';
angular.module('bahmni.clinical')
    .controller('EditObservationFormController', ['$scope', 'appService','$window','$rootScope',
        function ($scope, appService, $window, $rootScope) {
            var configForPrompting = appService.getAppDescriptor().getConfigValue('showSaveConfirmDialog');
            $scope.directivePreCloseCallback = function () {
                if (configForPrompting && $scope.shouldPromptBeforeClose) {
                    if ($window.confirm('You might lose unsaved data. Are you sure you want to leave this page?')) {
                        if(!$rootScope.hasVisitedConsultation){
                            $scope.shouldPromptBrowserReload = false;
                        }
                        return true;
                    }
                    return false;
                };
            };
            window.onbeforeunload = function () {
                if(configForPrompting && $scope.shouldPromptBrowserReload) {
                    return "You might lose unsaved data";
                }
            }
        }]);