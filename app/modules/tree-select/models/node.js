Bahmni.Opd.TreeSelect.Node = function() {
    var Node = function(uuid, label, children) {
        this.uuid = uuid;
        this.label = label;
        this.children = children;
        this.focus = false;
        this.selected = false;
    }

    Node.prototype = {
        getChildren: function(){
            return this.children;
        }
    }

    return Node;
}();
