Bahmni.Opd.TreeSelect.Columns = function() {
    var Columns = function(node) {
        this.columns = [];
        this.activeColumn = null;
        if(node != null && node.getChildren() != null && node.getChildren().length > 0){
            var newColumn = new Bahmni.Opd.TreeSelect.Column(node.getChildren());
            newColumn.setDefaultFocus();
            this.columns.push(newColumn);
            this.previewNodeExpansion(newColumn.getFocus(), newColumn);
        }
    }

    Columns.prototype = {
        previewNodeExpansion: function(node, column) {
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
            var newColumn = this.previewNodeExpansion(node, column);
            if(newColumn == null){
                return;
            }
            column.setActive(node);
            newColumn.setDefaultFocus();
            this.previewNodeExpansion(newColumn.getFocus(), newColumn);
        },

        click: function(node, column) {
            var previousColumn = this.getPreviousColumn(column);
            if(previousColumn != null) {
                previousColumn.setActive(previousColumn.getFocus());
            }
            this.previewNodeExpansion(node, column);
        },

        removeAllColumnsToRight: function(column, includeColumn){
            includeColumn = includeColumn || false;
            if(column == null)
                return;
            var index = this.columns.indexOf(column);
            index = includeColumn ? index : index + 1;
            this.columns = this.columns.slice(0, index);
        },

        activateFocusedItem: function() {
            this.expandNode(this.activeColumn.getFocus(), this.activeColumn);
        },

        activatePreviousColumn: function() {
            if(this.activeColumn == null){
                return;
            }
            var previousColumn = this.getPreviousColumn(this.activeColumn);
            if(previousColumn != null) {
                this.previewNodeExpansion(previousColumn.getActive(), previousColumn);
            }
        },

        focusOnPreviousItem: function() {
            if(this.activeColumn == null){
                return;
            }
            this.activeColumn.focusOnPreviousItem();
            this.previewNodeExpansion(this.activeColumn.getFocus(), this.activeColumn);
        },

        focusOnNextItem: function() {
            if(this.activeColumn == null){
                return;
            }
            this.activeColumn.focusOnNextItem();
            this.previewNodeExpansion(this.activeColumn.getFocus(), this.activeColumn);
        },

        getPreviousColumn: function(column) {
            var index = this.columns.indexOf(column);
            return (index > 0) ? this.columns[index - 1] : null;
        },

        getColumns: function(){
            return this.columns;
        },
    }

    return Columns;
}();
