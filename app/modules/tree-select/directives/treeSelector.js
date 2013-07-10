'use strict';

angular.module('opd.treeSelect')
    .directive('treeSelector', ['conceptTreeService', function (conceptTreeService) {
        var link = function($scope) {
            (function() {
                conceptTreeService.getConceptTree($scope.rootConceptName).then(function(conceptTree) {
                    $scope.columns = new Bahmni.Opd.TreeSelect.Columns(conceptTree);
                });
                var kbNavigation = Bahmni.Opd.TreeSelect.KeyboardNavigation;
                $('.opd-tree-selector').focus(function() {kbNavigation.addKeyboardHandlers($scope)});
                $('.opd-tree-selector').focusout(function() {kbNavigation.removeKeyboardHandlers()});
                $('.opd-tree-selector').focus();
            })();

            $scope.expandSubtree = function(item, activeColumn) {
                activeColumn.setActive(item);
                $scope.columns.addNewColumn(item, activeColumn);
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
 