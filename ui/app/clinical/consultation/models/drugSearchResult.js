Bahmni.Clinical.DrugSearchResult = (function () {
    var createSynonym = function (drug, synonymName) {
        var value = drug.dosageForm ? drug.name + " (" + drug.dosageForm.display + ")" : drug.name;
        var label = synonymName ? synonymName + " => " + value : value;
        return {
            label: label,
            value: value,
            drug: drug
        }
    };

    var create = function(drug){
        return createSynonym(drug);
    };

    var getMatcher = function (searchString) {
        return function (value) {
            //return value.search(new RegExp(searchString, "i")) !== -1
            return _.contains(value.toLowerCase(),searchString.toLowerCase());
        };
    };
    var getSynonymCreator = function (drug) {
        return function (name) {
            return createSynonym(drug, name);
        };
    };

    var getAllMatchingSynonyms = function (drug, searchString) {
        var doesMatchSearchString = getMatcher(searchString);
        var createSynonym = getSynonymCreator(drug);

        if (doesMatchSearchString(drug.name)) return [createSynonym()];

        var conceptNames = drug && drug.concept && drug.concept.names;
        var uniqConceptNames = _.uniq(_.pluck(conceptNames, 'name'));
        var namesThatMatches = _.filter(uniqConceptNames, doesMatchSearchString);
        namesThatMatches = _.sortBy(namesThatMatches);
        var allMatchingResults = _.map(namesThatMatches, createSynonym);

        return allMatchingResults;
    };

    return {
        create: create,
        createSynonym: createSynonym,
        getAllMatchingSynonyms: getAllMatchingSynonyms
    }
})();
