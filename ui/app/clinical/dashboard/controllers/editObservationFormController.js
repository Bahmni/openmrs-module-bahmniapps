'use strict';
angular.module('bahmni.clinical')
    .controller('EditObservationFormController', ['$scope', 'appService', '$window', '$rootScope', '$translate',
        function ($scope, appService, $window, $rootScope, $translate) {
            var configForPrompting = appService.getAppDescriptor().getConfigValue('showSaveConfirmDialog');
            $scope.directivePreCloseCallback = function () {
                $scope.resetContextChangeHandler();
                if (configForPrompting && $scope.shouldPromptBeforeClose) {
                    if ($window.confirm($translate.instant("POP_UP_CLOSE_DIALOG_MESSAGE_KEY"))) {
                        if (!$rootScope.hasVisitedConsultation) {
                            $scope.shouldPromptBrowserReload = false;
                        }
                        return true;
                    }
                    return false;
                }
            };
            window.onbeforeunload = function () {
                if (configForPrompting && $scope.shouldPromptBrowserReload) {
                    return $translate.instant("BROWSER_CLOSE_DIALOG_MESSAGE_KEY");
                }
            };
        }]);
