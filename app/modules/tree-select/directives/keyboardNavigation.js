Bahmni.Opd.TreeSelect.KeyboardNavigation = {
    addKeyboardHandlers: function($scope, selectedNodeService) {
        KeyboardJS.on("right", onRight);
        KeyboardJS.on("left", onLeft);
        KeyboardJS.on("up", onUp);
        KeyboardJS.on("down", onDown);
        KeyboardJS.on("enter", selectNode);
        KeyboardJS.on("space", selectNode);

        function onRight() {
            $scope.conceptExplorer.expandFocusedNode();
            $scope.$apply();
            return false;
        }

        function onLeft() {
            $scope.conceptExplorer.backToPreviousColumn();
            $scope.$apply();
            return false;
        }

        function onUp() {
            $scope.conceptExplorer.focusOnPreviousNode();
            $scope.$apply();
            return false;
        }

        function onDown() {
            $scope.conceptExplorer.focusOnNextNode();
            $scope.$apply();
            return false;
        }

        function selectNode() {
            var selectedNode = $scope.conceptExplorer.toggleSelectionForFocusedNode();
            if(selectedNode != null) {
                selectedNodeService.addNode(selectedNode);
            }
            $scope.$apply();
            return false;
        }
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