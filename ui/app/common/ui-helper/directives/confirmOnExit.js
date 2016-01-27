angular.module('bahmni.common.uiHelper')
    .directive('confirmOnExit', function() {
    return {
        link: function($scope) {
            $scope.$on("event:pageUnload", function () {
                window.onbeforeunload = function() {
                    return "You might lose unsaved data";
                }
            });
        }
    };
});