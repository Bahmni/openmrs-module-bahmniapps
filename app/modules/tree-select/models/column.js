var OpdTreeSelect = OpdTreeSelect != undefined ? OpdTreeSelect : {}
OpdTreeSelect.Column = function() {
    var Column = function(items) {
        this.items = items.slice(0);
        this.setDefaultFocus();
    }

    Column.prototype = {
        setFocus: function(item) {
            if(this.currentFocus != undefined) {
                this.currentFocus.focus = null;
            }
            this.currentFocus = item;
            item.focus = "focus";
        },

        setActive: function(item) {
            if(this.currentActive != undefined) {
                this.currentActive.active = null;
            }
            this.currentActive = item;
            item.active = "active";
            this.setFocus(item);
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
