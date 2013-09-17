Bahmni.Opd.TreeSelect.Node = function() {
    var Node = function(concept, children) {
        this.data = concept;

        this.uuid = concept.uuid;
        this.display = concept.display;
        this.conceptClass = concept.conceptClass != null ? concept.conceptClass.name : "";
        this.isSet = concept.set;
        this.isSelectableType = this.conceptClass === "LabSet" || !this.isSet;

        this.children = children || [];
        this.focus = false;
        this.selected = false;
        this.enabled = true;
    }

    Node.prototype = {
        toggleSelection: function() {
            if(this.isSelected()) {
                this.deselect();
            }else {
                this.select();
            }
        },

        isSelectable: function(){
            return this.isSelectableType && this.isEnabled();
        },

        shouldBeShown: function(){
            return !this.isSet || (this.children.length > 0);
        },

        setFocus: function() {
            this.focus = true;
        },

        getChildren: function(){
            return this.children;
        },

        isSelected: function() {
            return this.selected;
        },

        isDisabled: function() {
            return !this.enabled;
        },

        isEnabled: function(){
            return this.enabled;
        },

        isFocused: function() {
            return this.focus;
        },

        setSelectedNodesByUuids: function(uuids) {
            if(uuids.indexOf(this.uuid) >= 0) {
                this.select();
                return;
            }
            else {
                this.deselect();
                this.children.forEach(function(child){
                    child.setSelectedNodesByUuids(uuids);
                });
            }
        },

        select: function() {
            if(this.isSelectable()) {
                this.selected = true;
                this.selectChildren();                
            }
        },

        deselect: function() {
            this.selected = false;
            this.deselectChildren();
        },

        _disable: function() {
            this.enabled = false;
        },

        _enable: function() {
            this.enabled = true;
        },

        selectChildren: function() {
            this.children.forEach(function(child) {
                child.select();
                child._disable();
            })
        },

        deselectChildren: function() {
            this.children.forEach(function(child) {
                child.deselect();
                child._enable();
            })
        }
    }

    return Node;
}();
