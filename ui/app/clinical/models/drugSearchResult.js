Bahmni.Clinical.DrugSearchResult = function(drug, searchString) {
    this.getValue = function() {
        return drug.dosageForm ? drug.name + " (" + drug.dosageForm.display + ")" : drug.name;
    };

    this.getLabel = function(){
        var matchingName = drug.name.search(new RegExp(searchString, "i")) === -1 ? _.find(_.map(drug.concept.names, 'name'), function(name){ return name.search(new RegExp(searchString, "i")) !== -1 }) : null;
        return matchingName ? matchingName + " => " + this.getValue() : this.getValue();
    }
};
