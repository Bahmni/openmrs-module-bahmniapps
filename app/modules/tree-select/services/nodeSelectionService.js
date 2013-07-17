'use strict';

angular.module('opd.treeSelect.services')
    .factory('nodeSelectionService', [function () {

    var nodes = [];

    var getSelectedNodes = function () {
        return nodes;
    };

    var toggleSelection = function (node) {
        if (_isSelected(node)) {
            _removeNode(node);
        } else if (node.canAdd()) {
            _addNode(node);
        }
    }

    var addSelectedNodes = function (column) {
        var nodes = column.getAllSelectedNodes()
        nodes.forEach(function (node) {
            _addNode(node);
        })
    }

    var _isSelected = function (node) {
        return nodes.indexOf(node) > -1;
    }

    var _removeNode = function (node) {
        var index = nodes.indexOf(node);
        if (index >= 0) {
            nodes.splice(index, 1)
        }
    }

    var _addNode = function (node) {
        if (node.canAdd() && !_isSelected(node)) {
            nodes.push(node);
        }
    };

    return {
        getSelectedNodes:getSelectedNodes,
        toggleSelection:toggleSelection,
        addSelectedNodes:addSelectedNodes
    };
}]);