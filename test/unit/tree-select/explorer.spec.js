'use strict';


describe("Bahmni.Opd.TreeSelect.Explorer", function () {

    var Explorer = Bahmni.Opd.TreeSelect.Explorer;
    var Node = Bahmni.Opd.TreeSelect.Node;
    var explorer = null;
    var rootNode;

    beforeEach(function() {
        rootNode = getConceptTree();
        explorer = new Explorer(rootNode);
    });

    it('initialization should add first column and focus on first node', function() {
        expect(explorer.getActiveColumn().getFocus().display).toBe('L1_1');
        expect(explorer.getColumns().length).toBe(2);
    });

    it('focus should add child column for preview', function() {
        var column = explorer.getColumns()[1];
        var node = column.getNodes()[1];
        expect(node.display).toBe('L1_1_2');

        var childColumn = explorer.focus(node, column);

        expect(node.isFocused()).toBeTruthy();
        expect(childColumn.getNodes().length).toBe(1);
        expect(explorer.getActiveColumn()).toBe(column);
    });

    it('expanding a node should add child column and focus on its first node', function() {
        var column = explorer.getColumns()[1];
        var node = column.getNodes()[1];
        expect(node.display).toBe('L1_1_2');

        explorer.expandNode(node, column);

        expect(explorer.getActiveColumn().getNodes().length).toBe(1);
        expect(explorer.getActiveColumn().getFocus().display).toBe('L1_1_2_1');
    });

    it("selectFocusedNode should select focused node in active column", function(){
        var column = explorer.getColumns()[1];
        var node = column.getNodes()[1];
        expect(node.display).toBe('L1_1_2');
        expect(node.isSelectable()).toBe(true);

        explorer.focus(node, column);
        explorer.toggleSelectionForFocusedNode();

        expect(node.isSelected()).toBeTruthy();
    });

    var testData = {
        data: {
            results: [
                {display: "L1", conceptClass: {name: "Misc"}, set: true, setMembers: [
                    {display: "L1_1", conceptClass: {name: "Misc"}, set: true, setMembers: [
                        {display: "L1_1_1", conceptClass: {name: "LabSet"}, set: true, setMembers: [{display: "L1_1_1_1"}, {display: "L1_1_1_2"}]},
                        {display: "L1_1_2", conceptClass: {name: "LabSet"}, set: true, setMembers: [{display: "L1_1_2_1"}]},
                    ]},
                    {display: "L1_2", conceptClass: {name: "Misc"}, set: true, setMembers: [
                        {display: "L1_2_1", conceptClass: {name: "ConvSet"}, set: true, setMembers: [{display: "L1_2_1_1"}, {display: "L1_2_1_2"}]},
                        {display: "L1_2_2", conceptClass: {name: "ConvSet"}, set: true, setMembers: [{display: "L1_2_2_1"}]},
                    ]},
                    {display: "L1_3", conceptClass: {name: "Misc"}, set: true, setMembers: [
                        {display: "L1_3_1", conceptClass: {name: "Misc"}, set: true, setMembers: [{display: "L1_2_1_1"}, {display: "L1_2_1_2"}]},
                        {display: "L1_3_2", conceptClass: {name: "Misc"}, set: true, setMembers: [{display: "L1_2_2_1"}]},
                    ]}
                ]}
            ]
        }
    }

    function createConceptTree(concept) {
        var children = (concept.setMembers || []).map(function(child) {
            return createConceptTree(child);
        })
        return new Node(concept, children);
    }

    function getConceptTree(){
        return createConceptTree(testData.data.results[0]);
    }
});