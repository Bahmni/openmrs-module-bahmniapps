Bahmni.Opd.TreeSelect.Column = function() {
    var Column = function(items) {
        this.items = items.slice(0);
        this.resetItems();
    }

    Column.prototype = {
        setFocus: function(item) {
            this.resetItems();
            this.currentFocus = item;
            item.klass = "focus";
        },

        setActive: function(item) {
            this.resetItems();
            this.currentActive = item;
            item.klass = "active";
        },

        resetItems: function() {
            this.items.forEach(function(item) {
                item.klass = null;
            })
        },

        getActive: function() {
            return this.currentActive;
        },

        getFocus: function() {
            return this.currentFocus;
        },

        getItems: function() {
            return this.items;
        },

        focusOnNextItem: function() {
            var currentFocusIndex = this.items.indexOf(this.currentFocus);
            if(currentFocusIndex < (this.items.length - 1)) {
                this.setFocus(this.items[currentFocusIndex + 1])
            }
        },

        focusOnPreviousItem: function() {
            var currentFocusIndex = this.items.indexOf(this.currentFocus);
            if(currentFocusIndex > 0) {
                this.setFocus(this.items[currentFocusIndex - 1])
            }
        },

        setDefaultFocus: function() {
            if (this.items.length > 0) {
                this.setFocus(this.items[0]);
            }
        }
    }

    return Column;
}();
