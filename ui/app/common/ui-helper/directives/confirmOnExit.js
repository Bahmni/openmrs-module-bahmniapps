'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('confirmOnExit', ['$translate', function ($translate) {
        return {
            link: function ($scope) {
                var cleanUpListenerPageUnload = $scope.$on("event:pageUnload", function () {
                    window.onbeforeunload = function () {
                        return $translate.instant("BROWSER_CLOSE_DIALOG_MESSAGE_KEY");
                    };
                });

                $scope.$on("$destroy", cleanUpListenerPageUnload);
            }
        };
    }]);
