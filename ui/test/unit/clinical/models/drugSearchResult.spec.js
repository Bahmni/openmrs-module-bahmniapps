describe("DrugSchedule", function () {

    describe("createSynonym",function () {
        it("should return only the drug name when dosageForm does not exists", function () {
            var drug = {name: "Paracetamol 200mg", dosageForm: null};
            var drugSearchResult = Bahmni.Clinical.DrugSearchResult.createSynonym(drug);

            expect(drugSearchResult.value).toBe("Paracetamol 200mg");
        });

        it("should return the name and form when form exists", function () {
            var drug = {name: "Paracetamol 200mg", dosageForm: {display: "Tablet"}};
            var drugSearchResult = Bahmni.Clinical.DrugSearchResult.createSynonym(drug);

            expect(drugSearchResult.value).toBe("Paracetamol 200mg (Tablet)");
        });

        it("should return the label with synonym name when it is given", function () {
            var drug = {name: "Paracetamol 200mg", dosageForm: {display: "Tablet"}};
            var synonymName = "PCM";
            var drugSearchResult = Bahmni.Clinical.DrugSearchResult.createSynonym(drug, synonymName);

            expect(drugSearchResult.label).toBe("PCM => Paracetamol 200mg (Tablet)");
        });

        it("should return the label with out synonym name when it is not given", function () {
            var drug = {
                name: "Paracetamol 200mg",
                dosageForm: {display: "Tablet"},
                concept: {names: [{name: "PCM"}, {name: "Paracetamol"}]}
            };
            var drugSearchResult = Bahmni.Clinical.DrugSearchResult.createSynonym(drug);

            expect(drugSearchResult.label).toBe("Paracetamol 200mg (Tablet)");
        });

        it("should have drug along with the synonym created", function () {
            var drug = {name: "Paracetamol 200mg", dosageForm: null};
            var drugSearchResult = Bahmni.Clinical.DrugSearchResult.createSynonym(drug);

            expect(drugSearchResult.drug).toBe(drug);
        });
    });

    describe("getAllMatchingSynonyms",function () {
        it("should return only the search results of drugs whose name matches with the search string",function () {
            var drug = {name: "Paracetamol 200mg", dosageForm: null, concept:{
                names:[
                    {name:"paracetamoluse"},
                    {name:"paracetamol"}
                ]
            }};

            var searchString = "amoluse";
            var allMatchingSynonyms = Bahmni.Clinical.DrugSearchResult.getAllMatchingSynonyms(drug, searchString);

            expect(allMatchingSynonyms.length).toBe(1);
            expect(allMatchingSynonyms[0].label).toBe("paracetamoluse => Paracetamol 200mg");
        });

        it("should return only the search results of drugs whose name matches with multiple prefix search string",function () {
            var drug = {name: "Diphenhydramine hydrochloride 25 mg tablet", dosageForm: null, concept:{
                    names:[
                        {name:"Diphenhydramine hydrochloride"}
                    ]
                }};

            var searchString = "Diph hy";
            var allMatchingSynonyms = Bahmni.Clinical.DrugSearchResult.getAllMatchingSynonyms(drug, searchString);

            expect(allMatchingSynonyms.length).toBe(1);
            expect(allMatchingSynonyms[0].label).toBe("Diphenhydramine hydrochloride 25 mg tablet");
        });

        it("should return unique list of search results when more than one name is same",function () {
            var drug = {name: "Paracetamol 200mg", dosageForm: null, concept:{
                names:[
                    {name:"paracetamoluse"},
                    {name:"paracetamoluse"}
                ]
            }};

            var searchString = "amoluse";
            var allMatchingSynonyms = Bahmni.Clinical.DrugSearchResult.getAllMatchingSynonyms(drug, searchString);

            expect(allMatchingSynonyms.length).toBe(1);
            expect(allMatchingSynonyms[0].label).toBe("paracetamoluse => Paracetamol 200mg");

        });

        it("should return a sorted list of search results",function () {
            var drug = {name: "Paracetamol 200mg", dosageForm: null, concept:{
                names:[
                    {name:"naracetamoluse"},
                    {name:"paracetamoluse"},
                    {name:"maracetamoluse"}
                ]
            }};

            var searchString = "amoluse";
            var allMatchingSynonyms = Bahmni.Clinical.DrugSearchResult.getAllMatchingSynonyms(drug, searchString);

            expect(allMatchingSynonyms.length).toBe(3);
            expect(allMatchingSynonyms[0].label).toBe("maracetamoluse => Paracetamol 200mg");
            expect(allMatchingSynonyms[1].label).toBe("naracetamoluse => Paracetamol 200mg");
            expect(allMatchingSynonyms[2].label).toBe("paracetamoluse => Paracetamol 200mg");

        });
    });
});