Bahmni.Opd.TreeSelect.Node = function() {
    var Node = function(concept, children) {
        this.uuid = concept.uuid;
        this.display = concept.display;
        this.setConceptClass(concept.conceptClass);
        this.isSet = concept.set;

        this.children = children;
        this.focus = false;
        this.selected = false;
    }

    Node.prototype = {
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

        isFocused: function() {
            return this.focus;
        },

        toggleSelection: function() {
            if(this.isSelectable()){
                this.selected = !this.selected; 
            }
        },

        isSelectable: function() {
            if(this.conceptClass == "LabSet" || this.conceptClass == "ConvSet"){
                return true;
            }else if(!this.isSet){
                return true;
            }
            return false;
        }
    }

    return Node;
}();
