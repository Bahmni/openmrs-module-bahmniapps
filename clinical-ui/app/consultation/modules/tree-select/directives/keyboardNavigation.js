Bahmni.Opd.TreeSelect.KeyboardNavigation = {
    addKeyboardHandlers: function($scope) {
        function explorerAction(action) {
            return function() {
                $scope.conceptExplorer[action]();
                $scope.$apply();
                return false;
            };
        }       

        KeyboardJS.on("right", explorerAction('expandFocusedNode'));
        KeyboardJS.on("left", explorerAction('backToPreviousColumn'));
        KeyboardJS.on("up", explorerAction('focusOnPreviousNode'));
        KeyboardJS.on("down", explorerAction('focusOnNextNode'));
        KeyboardJS.on("enter", explorerAction('toggleSelectionForFocusedNode'));
        KeyboardJS.on("space", explorerAction('toggleSelectionForFocusedNode'));
    },

    removeKeyboardHandlers: function() {
        KeyboardJS.clear("right");
        KeyboardJS.clear("left");
        KeyboardJS.clear("down");
        KeyboardJS.clear("up");
        KeyboardJS.clear("enter");
        KeyboardJS.clear("space");
    }
};