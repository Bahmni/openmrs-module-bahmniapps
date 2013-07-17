'use strict';

describe("nodeSelectionService", function () {
    beforeEach(module('opd.treeSelect.services'));

    var Node = Bahmni.Opd.TreeSelect.Node;
    var Column = Bahmni.Opd.TreeSelect.Column;

    describe("toggleNodeSelection", function () {
        it('should add selectable node', inject(['nodeSelectionService', function (nodeSelectionService) {
            var node = new Node({display: "selectable node", conceptClass: {name: "LabSet"}});
            expect(node.isSelectable()).toBeTruthy();

            nodeSelectionService.toggleSelection(node);
            expect(nodeSelectionService.getSelectedNodes()).toContain(node);
        }]));

        it('should not add non selectable node', inject(['nodeSelectionService', function (nodeSelectionService) {
            var node = new Node({display: "non selectable node", conceptClass: {name: "ConvSet"}, set: true});
            expect(node.isSelectable()).toBeFalsy();

            nodeSelectionService.toggleSelection(node);
            expect(nodeSelectionService.getSelectedNodes()).not.toContain(node);
        }]));

        it('should deselect node if already selected', inject(['nodeSelectionService', function (nodeSelectionService) {
            var node = new Node({display: "selectable node", conceptClass: {name: "LabSet"}});
            expect(node.isSelectable()).toBeTruthy();
            nodeSelectionService.toggleSelection(node);
            expect(nodeSelectionService.getSelectedNodes()).toContain(node);

            nodeSelectionService.toggleSelection(node);

            expect(nodeSelectionService.getSelectedNodes()).not.toContain(node);
        }]));
    });

    describe("addSelectedNodes", function () {
        it('should add selected nodes in column', inject(['nodeSelectionService', function (nodeSelectionService) {
            var node1 = new Node({display: "selectable node 1", conceptClass: {name: "LabSet"}});
            var node2 = new Node({display: "selectable node 2", conceptClass: {name: "LabSet"}});
            node1.select();
            node2.select();
            var column = new Column([node1, node2]);

            nodeSelectionService.addSelectedNodes(column);

            expect(nodeSelectionService.getSelectedNodes()).toContain(node1);
            expect(nodeSelectionService.getSelectedNodes()).toContain(node2);
        }]));

        it('should not add selected nodes in column if already added', inject(['nodeSelectionService', function (nodeSelectionService) {
            var node1 = new Node({display: "selectable node 1", conceptClass: {name: "LabSet"}});
            var node2 = new Node({display: "selectable node 2", conceptClass: {name: "LabSet"}});
            node1.select();
            node2.select();
            var column = new Column([node1, node2]);
            nodeSelectionService.addSelectedNodes(column);
            expect(nodeSelectionService.getSelectedNodes()).toContain(node1);
            expect(nodeSelectionService.getSelectedNodes()).toContain(node2);
            expect(nodeSelectionService.getSelectedNodes().length).toBe(2);

            nodeSelectionService.addSelectedNodes(column);

            expect(nodeSelectionService.getSelectedNodes().length).toBe(2);
            expect(nodeSelectionService.getSelectedNodes()).toContain(node1);
            expect(nodeSelectionService.getSelectedNodes()).toContain(node2);
        }]));
    });
});
