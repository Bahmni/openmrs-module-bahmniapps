Bahmni.Opd.TreeSelect.KeyboardNavigation = {
    addKeyboardHandlers: function($scope) {
        KeyboardJS.on("right", onRight);
        KeyboardJS.on("left", onLeft);
        KeyboardJS.on("up", onUp);
        KeyboardJS.on("down", onDown);

        function onRight() {
            $scope.columns.activateFocusedItem();
            $scope.$apply();
        }

        function onLeft() {
            $scope.columns.activatePreviousColumn();
            $scope.$apply();
        }

        function onUp() {
            $scope.columns.focusOnPreviousItem();
            $scope.$apply();
        }

        function onDown() {
            $scope.columns.focusOnNextItem();
            $scope.$apply();
        }
    },

    removeKeyboardHandlers: function() {
        KeyboardJS.clear("right");
        KeyboardJS.clear("left");
        KeyboardJS.clear("down");
        KeyboardJS.clear("up");
    }
};