'use strict';

angular.module('opd.treeSelect.services')
    .factory('selectedNodeService', [function () {

    var nodes = [];

    var addNode = function(node) {
        nodes.push(node);
    };

    var getAllNodes = function() {
        return nodes;
    };

    return {
        addNode:addNode,
        getAllNodes: getAllNodes
    };
}]);