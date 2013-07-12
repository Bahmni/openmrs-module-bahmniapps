Bahmni.Opd.TreeSelect.Explorer = function() {
    var Explorer = function(node) {
        this.columns = [];
        this.activeColumn = null;
        if(node != null && node.getChildren() != null && node.getChildren().length > 0){
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
            if(node != null && node.getChildren().length == 0) {
                return null;
            }
            this.removeAllColumnsToRight(column, false);
            var newColumn = new Bahmni.Opd.TreeSelect.Column(node.getChildren());
            this.columns.push(newColumn);
            return newColumn;
        },

        expandNode: function(node, column) {
            var newColumn = this.focus(node, column);
            if(newColumn == null){
                return;
            }
            newColumn.setDefaultFocus();
            this.focus(newColumn.getFocus(), newColumn);
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
            this.activeColumn.focusOnPreviousItem();
            this.focus(this.activeColumn.getFocus(), this.activeColumn);
        },

        focusOnNextNode: function() {
            if(this.activeColumn == null){
                return;
            }
            this.activeColumn.focusOnNextItem();
            this.focus(this.activeColumn.getFocus(), this.activeColumn);
        },

        selectFocusedNode: function() {
            if(this.activeColumn == null){
                return null;
            }
            this.activeColumn.selectFocusedNode();
            return this.activeColumn.getFocus();
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

        getColumns: function(){
            return this.columns;
        },

        isActive: function(column){
            return this.activeColumn == column;
        }
    }

    return Explorer;
}();
