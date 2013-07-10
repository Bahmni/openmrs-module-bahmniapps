Bahmni.Opd.TreeSelect.KeyboardNavigation = {
    addKeyboardHandlers: function($scope) {
        KeyboardJS.on("right", onRight);
        KeyboardJS.on("left", onLeft);
        KeyboardJS.on("up", onUp);
        KeyboardJS.on("down", onDown);

        function onRight() {
            var lastColumn = $scope.columns.getLastColumn();
            lastColumn && $scope.expandSubtree(lastColumn.getFocus(), lastColumn);
            $scope.$apply();
        }

        function onLeft() {
            if ($scope.columns.getColumns().length <= 1)
                return;
            $scope.columns.removeAllColumnsToRight($scope.columns.getLastColumn(), true);
            $scope.$apply();
        }

        function onUp() {
            var lastColumn = $scope.columns.getLastColumn();
            lastColumn && lastColumn.focusOnPreviousItem();
            $scope.$apply();
        }

        function onDown() {
            var lastColumn = $scope.columns.getLastColumn();
            lastColumn && lastColumn.focusOnNextItem();
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