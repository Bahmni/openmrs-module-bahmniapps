Bahmni.Opd.TreeSelect.Node = function() {
    var Node = function(concept, children) {
        this.data = concept;

        this.uuid = concept.uuid;
        this.display = concept.display;
        this.conceptClass = concept.conceptClass != null ? concept.conceptClass.display : "";
        this.set = concept.set;
        this.isSelectableType = this.conceptClass === Bahmni.Opd.Consultation.Constants.labSetConceptName || !this.set;

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

        isSelectableTypeSet: function() {
            return this.isSelectableType && this.set;
        },
        
        isSelectable: function(){
            return this.isSelectableType && this.isEnabled();
        },

        shouldBeShown: function(){
            return !this.set || (this.children.length > 0);
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

        selectNodes: function(criteria) {
            if(criteria(this)) {
                this.select();
                return;
            }
            else {
                this.deselect();
                this.children.forEach(function(child){
                    child.selectNodes(criteria);
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

        getSelectedChildren: function() {
            return this.children.filter(function(child) {
                return child.isSelected();
            })
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
