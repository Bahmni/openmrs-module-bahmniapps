Bahmni.Opd.TreeSelect.Explorer = function() {
    var Explorer = function(node, observer) {
        this.columns = [];
        this.rootNode = node;
        this.observer = observer || {onAddNodes: function(){}, onRemoveNodes: function(){} };;
        this.activeColumn = null;
        if(node.getChildren() && node.getChildren().length > 0){
            var newColumn = new Bahmni.Opd.TreeSelect.Column(node.getChildren());
            newColumn.setDefaultFocus();
            this.columns.push(newColumn);
            this.focus(newColumn.getFocus(), newColumn);
        }
    }

    Explorer.prototype = {
        focus: function(node, column) {
            this.activeColumn = column;
            column.setFocus(node);
            return this.previewChildColumn(node, column);
        },

        previewChildColumn: function(node, column) {
            if(node != null && node.getChildren().length == 0) {
                return null;
            }
            this.removeAllColumnsToRight(column, false);
            var childColumn = new Bahmni.Opd.TreeSelect.Column(node.getChildren());
            this.columns.push(childColumn);
            return childColumn;
        },

        expandNode: function(node, column) {
            var childColumn = this.previewChildColumn(node, column);
            if(childColumn && childColumn.hasNodes()) {
                this.focus(childColumn.getDefaultFocus(), childColumn);
            }
        },

        expandFocusedNode: function() {
            this.expandNode(this.activeColumn.getFocus(), this.activeColumn);
        },

        backToPreviousColumn: function() {
            if(this.activeColumn == null){
                return;
            }
            var previousColumn = this.getPreviousColumn(this.activeColumn);
            if(previousColumn != null) {
                this.focus(previousColumn.getFocus(), previousColumn);
            }
        },

        focusOnPreviousNode: function() {
            if(this.activeColumn == null){
                return;
            }
            this.activeColumn.focusOnPreviousNode();
            this.focus(this.activeColumn.getFocus(), this.activeColumn);
        },

        focusOnNextNode: function() {
            if(this.activeColumn == null){
                return;
            }
            this.activeColumn.focusOnNextNode();
            this.focus(this.activeColumn.getFocus(), this.activeColumn);
        },

        notifyObserverForNode: function(node) {
            var observerNotification = node.isSelected() ? this.observer.onAddNodes : this.observer.onRemoveNodes;
            observerNotification([node]);            
        },
        
        selectNode: function(node){
            node.select();
            this.notifyObserverForNode(node);
        },
        
        toggleSelectionForFocusedNode: function() {            
            var focusedNode = this.getFocusedNode();
            if(focusedNode == null) return;
            focusedNode.toggleSelection();
            this.notifyObserverForNode(focusedNode);
        },

        canAddNode: function (node){
            return node.isSelectable() && !node.isSelected();
        },

        setSelectedNodesByUuids: function(uuids) {
            this.rootNode.setSelectedNodesByUuids(uuids);
        },

        removeAllColumnsToRight: function(column, includeColumn){
            includeColumn = includeColumn || false;
            if(column == null)
                return;
            var index = this.columns.indexOf(column);
            index = includeColumn ? index : index + 1;
            this.columns = this.columns.slice(0, index);
        },

        getPreviousColumn: function(column) {
            var index = this.columns.indexOf(column);
            return (index > 0) ? this.columns[index - 1] : null;
        },

        getActiveColumn: function() {
            return this.activeColumn;
        },

        getColumns: function(){
            return this.columns;
        },

        getFocusedNode: function(){
            return this.activeColumn ? this.activeColumn.getFocus() : null;
        },

        isActive: function(column){
            return this.activeColumn == column;
        }
    }

    return Explorer;
}();
