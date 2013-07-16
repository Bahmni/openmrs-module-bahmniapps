'use strict';

describe("Bahmni.Opd.TreeSelect.Column", function () {

    var Node = Bahmni.Opd.TreeSelect.Node;
    var Column = Bahmni.Opd.TreeSelect.Column;

    it('should return true if column has selectable node', function() {
        var selectableNode = new Node({display: "default concept", conceptClass: {name: "LabSet"}});
        expect(selectableNode.isSelectable()).toBeTruthy();

        var column = new Column([selectableNode])
        column.setFocus(selectableNode);

        expect(column.hasSelectableItem()).toBe(true);
    });

    it('should return false if column has selectable node but is not in focus', function() {
        var selectableNode = new Node({display: "default concept", conceptClass: {name: "LabSet"}});
        expect(selectableNode.isSelectable()).toBeTruthy();

        var column = new Column([selectableNode])

        expect(column.hasSelectableItem()).toBe(false);
    });

    it('should return false if column has selectable node is in focus but had all disabled nodes', function() {
        var selectableNode = new Node({display: "default concept", conceptClass: {name: "LabSet"}});
        selectableNode.enabled = false;
        expect(selectableNode.isSelectable()).toBeTruthy();

        var column = new Column([selectableNode])
        column.setFocus(selectableNode);

        expect(column.hasSelectableItem()).toBe(false);
    });
});