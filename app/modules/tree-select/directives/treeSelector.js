'use strict';

angular.module('opd.treeSelect')
    .directive('treeSelector', ['conceptTreeService', 'selectedNodeService', function (conceptTreeService, selectedNodeService) {
        var link = function($scope, elem) {
            (function() {
                conceptTreeService.getConceptTree($scope.rootConceptName).then(function(conceptTree) {
                    $scope.conceptExplorer = new Bahmni.Opd.TreeSelect.Explorer(conceptTree);
                });
                var kbNavigation = Bahmni.Opd.TreeSelect.KeyboardNavigation;
                $('.opd-tree-selector').focus(function() {kbNavigation.addKeyboardHandlers($scope, selectedNodeService)});
                $('.opd-tree-selector').focusout(function() {kbNavigation.removeKeyboardHandlers()});
                $('.opd-tree-selector').focus();
            })();

            $scope.expandNode = function(node, column) {
                $scope.conceptExplorer.focus(node, column);
                $scope.selectNode(node, column);
            }

            $scope.selectNode = function(node, column) {
                $scope.conceptExplorer.toggleSelectionForFocusedNode();
                selectedNodeService.addNode(node);
            }

            $scope.getClass = function(node) {
                return node.isFocused() ? "focus" : "";
            }

            $scope.getSelectionClass = function(node) {
                if(node.isSelected()) {
                    return node.isFocused() ? "icon-white icon-ok" : "icon-ok";
                }
                return "";
            }

        };

        return {
            restrict: 'A',
            templateUrl: 'modules/tree-select/views/treeSelector.html',
            link: link,
            scope: {
                rootConceptName: "="
            }
        };
    }]);
 