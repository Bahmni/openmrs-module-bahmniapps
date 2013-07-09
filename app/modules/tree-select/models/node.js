var OpdTreeSelect = OpdTreeSelect != undefined ? OpdTreeSelect : {}
OpdTreeSelect.Node = function() {
    var Node = function(label, children) {
        this.label = label;
        this.children = children;
    }

    Node.prototype = {
        getChildren: function(){
            return this.children;
        }
    }

    return Node;
}();
