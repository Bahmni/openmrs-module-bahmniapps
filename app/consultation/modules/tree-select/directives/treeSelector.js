'use strict';

angular.module('opd.treeSelect')
    .directive('treeSelector', ['conceptTreeService', function (conceptTreeService) {
        var link = function($scope, elem) {
            (function() {
                var observer = {onAddNodes: $scope.onAddNodes(), onRemoveNodes: $scope.onRemoveNodes() };
                conceptTreeService.getConceptTree($scope.rootConceptName).then(function(conceptTree) {
                    $scope.conceptExplorer = new Bahmni.Opd.TreeSelect.Explorer(conceptTree, observer);
                    $scope.$watch('ngModel.length', function(){
                        $scope.conceptExplorer.setSelectedNodesByUuids($scope.ngModel.map(function(item){ return item.uuid; }));
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
                ngModel: '=',
                rootConceptName: "=",
                onAddNodes: "&",
                onRemoveNodes: "&"
            }
        };
    }]);
 