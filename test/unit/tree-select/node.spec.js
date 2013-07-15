'use strict';

describe("Bahmni.Opd.TreeSelect.Node", function () {

    var Node = Bahmni.Opd.TreeSelect.Node;

    it('should be selectable when conceptClass is LabSet', function() {
        var node_null_set = new Node({display: "default concept", conceptClass: {name: "LabSet"}});
        var node_true_set = new Node({display: "default concept", set: true, conceptClass: {name: "LabSet"}});
        
        expect(node_null_set.isSelectable()).toBe(true);
        expect(node_true_set.isSelectable()).toBe(true);
    });

    it('should be selectable when conceptClass is not a set', function() {
        var node_false_set = new Node({display: "default concept", set: false, conceptClass: {name: "Misc"}});
        var node_null_set = new Node({display: "default concept", set: null, conceptClass: {name: "Misc"}});
        var node_missing_set = new Node({display: "default concept", conceptClass: {name: "Misc"}});
        expect(node_false_set.isSelectable()).toBe(true);
        expect(node_null_set.isSelectable()).toBe(true);
        expect(node_missing_set.isSelectable()).toBe(true);
    });

    it('should not be selectable when it is a set', function() {
        var node = new Node({display: "default concept", set: true, conceptClass: {name: "Misc"}});
        expect(node.isSelectable()).toBe(false);
    });
});