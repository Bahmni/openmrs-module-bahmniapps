'use strict';

console.log()

describe("nodeSelectionService", function () {
    beforeEach(module('opd.treeSelect.services'));

    var Node = Bahmni.Opd.TreeSelect.Node;

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
});
