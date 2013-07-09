var OpdTreeSelect = OpdTreeSelect != undefined ? OpdTreeSelect : {}
OpdTreeSelect.Columns = function() {
    var Columns = function(node) {
        this.columns = [];
        if(node != null){
            this.addNewColumn(node, null);
        }
    }

    Columns.prototype = {
        addNewColumn: function(node, currentActiveColumn){
            children = node.getChildren();
            if(children.length == 0) {
                return
            }
            this.removeAllColumnsToRight(currentActiveColumn, false);
            this.columns.push(new OpdTreeSelect.Column(children));
        },

        removeAllColumnsToRight: function(column, includeColumn){
            includeColumn = includeColumn || false;
            if(column === null)
                return;
            var index = this.columns.indexOf(column);
            index = includeColumn ? index : index + 1;
            this.columns = this.columns.slice(0, index);
        },

        getColumns: function(){
            return this.columns;
        },

        getLastColumn: function(){
            if(this.columns.length > 0){
                return this.columns[this.columns.length - 1];
            }
            return null;
        },

    }

    return Columns;
}();
