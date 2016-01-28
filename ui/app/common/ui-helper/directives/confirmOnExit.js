angular.module('bahmni.common.uiHelper')
    .directive('confirmOnExit', function() {
    return {
        link: function($scope, $translate) {
            $scope.$on("event:pageUnload", function () {
                window.onbeforeunload = function() {
                    return $translate.instant("BROWSER_CLOSE_DIALOG_MESSAGE_KEY");
                }
            });
        }
    };
});