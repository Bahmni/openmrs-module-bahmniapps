'use strict';
angular.module('bahmni.clinical')
    .controller('EditObservationFormController', ['$scope', 'appService','$window',
        function ($scope, appService, $window) {
            var configForPrompting = appService.getAppDescriptor().getConfigValue('showSaveConfirmDialog');
            $scope.directivePreCloseCallback = function () {
                if (configForPrompting && $scope.shouldPromptBeforeReload) {
                    if ($window.confirm('You might lose unsaved data. Are you sure you want to leave this page?')) {
                        $scope.shouldPromptBrowserReload = false;
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