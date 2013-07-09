'use strict';

angular.module('opd.treeSelect.controllers')
    .controller('TreeSelectController', ['$scope', '$route', 'labInvestigationsService', function ($scope, $route, labInvestigationsService) {
 
        (function() {
            labInvestigationsService.getInvestigations().then(function(conceptTree) {
                $scope.columns = new OpdTreeSelect.Columns(conceptTree);
            })
            $('#tree-selector').focus(function() { addKeyboardHandlers()});
            $('#tree-selector').focusout(function() { removeKeyboardHandlers()});
            $('#tree-selector').focus();
        })();

        $scope.expandSubtree = function(item, activeColumn) {
            activeColumn.setActive(item);
            $scope.columns.addNewColumn(item, activeColumn);
        }

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

        function addKeyboardHandlers() {
            KeyboardJS.on("right", onRight);
            KeyboardJS.on("left", onLeft);
            KeyboardJS.on("down", onDown);
            KeyboardJS.on("up", onUp);
        }

        function removeKeyboardHandlers() {
            KeyboardJS.clear("right");
            KeyboardJS.clear("left");
            KeyboardJS.clear("down");
            KeyboardJS.clear("up");
        };

    }]);
 