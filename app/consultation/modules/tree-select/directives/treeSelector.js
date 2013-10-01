'use strict';

angular.module('opd.treeSelect')
    .directive('treeSelector', ['conceptTreeService', function (conceptTreeService) {
        var link = function($scope, elem) {            
            var itemComparer = $scope.itemComparer();
            var itemMapper = $scope.itemMapper(); 

            var convertDataToItem = function(data){
                return itemMapper(data, $scope.additionalData);
            }

            var selectedItemshasItem = function(item) {
                for(var i=0; i < $scope.selectedItems.length; i++) {
                    if(itemComparer($scope.selectedItems[i], item)) {
                        return true;
                    }
                }
                return false;
            }

            var removeItemForNode = function(node) {
                for(var i=0; i < $scope.selectedItems.length; i++) {
                    if(itemComparer($scope.selectedItems[i], convertDataToItem(node.data))) {
                        $scope.selectedItems.splice(i, 1);
                        return;
                    }
                }
            }

            var addItemFromNode = function(node) {
                var item = convertDataToItem(node.data);
                if(!selectedItemshasItem(item)){
                    $scope.selectedItems.push(item);
                };
            } 

            var onAddNodes = function(nodes){
                nodes.forEach(addItemFromNode);
            };

            var onRemoveNodes = function(nodes){
                nodes.forEach(removeItemForNode);
            };

            (function() {
                var observer = {onAddNodes: onAddNodes, onRemoveNodes: onRemoveNodes};
                conceptTreeService.getConceptTree($scope.rootConceptName).then(function(conceptTree) {
                    $scope.conceptExplorer = new Bahmni.Opd.TreeSelect.Explorer(conceptTree, observer);
                    $scope.$watch('selectedItems.length', function(){
                        $scope.conceptExplorer.selectNodes(function(node){
                            var item = convertDataToItem(node.data);
                            return selectedItemshasItem(item);
                        });
                    });
                });
                var kbNavigation = Bahmni.Opd.TreeSelect.KeyboardNavigation;
                $('.opd-tree-selector').focus(function() {kbNavigation.addKeyboardHandlers($scope)});
                $('.opd-tree-selector').focusout(function() {kbNavigation.removeKeyboardHandlers()});
                $('.opd-tree-selector').focus();

            })();

            $scope.clickNode = function (node, column){
                $scope.conceptExplorer.focus(node, column);
            }

            $scope.addNode = function (node){
                $scope.conceptExplorer.selectNode(node);
            }

            $scope.canAddNode = function (node){
                return $scope.conceptExplorer.canAddNode(node);
            }

            $scope.getClass = function(node) {
                var clazz = "";
                if(node.isFocused() && node.isEnabled()){
                    clazz = "focus";
                } else if(node.isDisabled()){
                    clazz = "disabled"
                }
                return clazz;
            }

            $scope.getSelectionClass = function(node) {
                if(node.isSelected()) {
                    return node.isFocused() && node.isEnabled() ? "icon-white icon-ok" : "icon-ok";
                }
                return "";
            }
        };

        return {
            restrict: 'A',
            templateUrl: 'modules/tree-select/views/treeSelector.html',
            link: link,
            require: '^ngModel',
            scope: {
                selectedItems: '=ngModel',
                rootConceptName: "=",
                additionalData: "=",
                itemMapper: "&",
                itemComparer: "&"
            }
        };
    }]);
 