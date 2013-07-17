'use strict';

angular.module('opd.treeSelect')
    .directive('treeSelector', ['conceptTreeService', 'nodeSelectionService', function (conceptTreeService, nodeSelectionService) {
        var link = function($scope, elem) {
            (function() {
                conceptTreeService.getConceptTree($scope.rootConceptName).then(function(conceptTree) {
                    $scope.conceptExplorer = new Bahmni.Opd.TreeSelect.Explorer(conceptTree);
                });
                var kbNavigation = Bahmni.Opd.TreeSelect.KeyboardNavigation;
                $('.opd-tree-selector').focus(function() {kbNavigation.addKeyboardHandlers($scope, nodeSelectionService)});
                $('.opd-tree-selector').focusout(function() {kbNavigation.removeKeyboardHandlers()});
                $('.opd-tree-selector').focus();
            })();

            $scope.expandNode = function(node, column) {
                $scope.conceptExplorer.focus(node, column);
            }

            $scope.clickNode = function (node, column){

                $scope.expandNode(node, column);
                $scope.selectNode(node);
            }

            $scope.selectNode = function(node) {
                if(node.isSet){
                    return;
                }else{
                    node.selected = true;
                }
            }

            $scope.toggleNodeSelection = function(column) {
                $scope.conceptExplorer.selectFocusedNode()
                nodeSelectionService.addSelectedNodes(column);
            }

            $scope.getClass = function(node) {
                var clazz = "";
                if(node.isFocused()){
                    clazz = "focus";
                } else if(node.isDisabled()){
                    clazz = "disabled"
                }
                return clazz;
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
 