'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('confirmOnExit',['$translate', function($translate){
    return {
        link: function($scope) {
            $scope.$on("event:pageUnload", function () {
                window.onbeforeunload = function() {
                    return $translate.instant("BROWSER_CLOSE_DIALOG_MESSAGE_KEY");
                }
            });
        }
    };
}]);