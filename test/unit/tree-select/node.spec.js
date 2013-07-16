'use strict';

describe("Bahmni.Opd.TreeSelect.Node", function () {

    var Node = Bahmni.Opd.TreeSelect.Node;

    describe("isSelectable", function () {
        it('should be true when conceptClass is LabSet', function() {
            var node_null_set = new Node({display: "default concept", conceptClass: {name: "LabSet"}});
            var node_true_set = new Node({display: "default concept", set: true, conceptClass: {name: "LabSet"}});
            
            expect(node_null_set.isSelectable()).toBe(true);
            expect(node_true_set.isSelectable()).toBe(true);
        });

        it('should be true when conceptClass is not a set', function() {
            var node_false_set = new Node({display: "default concept", set: false, conceptClass: {name: "Misc"}});
            var node_null_set = new Node({display: "default concept", set: null, conceptClass: {name: "Misc"}});
            var node_missing_set = new Node({display: "default concept", conceptClass: {name: "Misc"}});
            expect(node_false_set.isSelectable()).toBe(true);
            expect(node_null_set.isSelectable()).toBe(true);
            expect(node_missing_set.isSelectable()).toBe(true);
        });

        it('should be false when it is a set', function() {
            var node = new Node({display: "default concept", set: true, conceptClass: {name: "Misc"}});
            expect(node.isSelectable()).toBe(false);
        });
    });

    xdescribe("toggleSelection", function () {
        it('should select a node', function() {
            var node = new Node({display: "default concept", conceptClass: {name: "Misc"}});
            
            node.toggleSelection();

            expect(node.isSelected()).toBeTruthy();
        });

        it('should deselect if node is already selected', function() {
            var node = new Node({display: "default concept", conceptClass: {name: "Misc"}});
            node.toggleSelection();
            expect(node.isSelected()).toBeTruthy();

            node.toggleSelection();

            expect(node.isSelected()).toBeFalsy();
        });

        it('should select its children', function() {
            var child1 = new Node({display: "child concept 1", conceptClass: {name: "Misc"}});
            var child2 = new Node({display: "child concept 2", conceptClass: {name: "Misc"}});  
            var node = new Node({display: "default concept", set: true, conceptClass: {name: "LabSet"}, children: [child1, child2]});

            node.toggleSelection();

            expect(node.isSelected()).toBeTruthy();
            expect(child1.isSelected()).toBeTruthy();
            expect(child2.isSelected()).toBeTruthy();

        });
    });

});