Bahmni.Opd.TreeSelect.Node = function() {
    var Node = function(concept, children) {
        this.uuid = concept.uuid;
        this.display = concept.display;
        this.setConceptClass(concept.conceptClass);
        this.isSet = concept.set;

        this.children = (children) ? children : [];
        this.focus = false;
        this.selected = false;
        this.enabled = true;
    }

    Node.prototype = {
        toggleSelection: function() {
            if(this.isSelectable() && this.isEnabled()){
                this.selected = !this.selected;
            }
            if(this.isSelected()) {
                this.selectChildren();
            }else {
                this.deselectChildren();
            }

        },

        canAdd: function(){
          return this.isSelectable() && this.isEnabled();
        },

        setFocus: function() {
            this.focus = true;
        },

        getChildren: function(){
            return this.children;
        },

        setConceptClass: function(conceptClass) {
            if(conceptClass != null) {
                this.conceptClass = conceptClass.name;
            }
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

        isSelectable: function() {
            if(this.conceptClass == "LabSet"){
                return true;
            }else if(!this.isSet){
                return true;
            }
            return false;
        },

        select: function() {
            this.selected = true;
            this.selectChildren();
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
