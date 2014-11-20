describe("DrugSchedule", function () {

    describe("getLabel", function(){
        it("should return the label without concept name when search term matches the drug name", function(){
            var drug = {name: "Paracetamol 200mg", dosageForm: {display: "Tablet"}};
            var searchTerm = "para";
            var drugSearchResult = new Bahmni.Clinical.DrugSearchResult(drug, searchTerm);

            var label = drugSearchResult.getLabel();

            expect(label).toBe("Paracetamol 200mg (Tablet)");
        });

        it("should return the label with concept name when drug name does not match and concept name matches", function(){
            var drug = {name: "Paracetamol 200mg", dosageForm: {display: "Tablet"},concept: {names:[{name: "PCM"}, {name: "Paracetamol"}]}};
            var searchTerm = "pcm";
            var drugSearchResult = new Bahmni.Clinical.DrugSearchResult(drug, searchTerm);

            var label = drugSearchResult.getLabel();

            expect(label).toBe("PCM => Paracetamol 200mg (Tablet)");
        });

        it("should return the label without concept name when both drug name and concept name matches", function(){
            var drug = {name: "Paracetamol 200mg", dosageForm: {display: "Tablet"}, concept: {names:[{name: "PCM"}, {name: "Paracetamol"}]}};
            var searchTerm = "paracetamol";
            var drugSearchResult = new Bahmni.Clinical.DrugSearchResult(drug, searchTerm);

            var label = drugSearchResult.getLabel();

            expect(label).toBe("Paracetamol 200mg (Tablet)");
        })
    })

    describe("getValue", function(){
        it("should return the name and form when form exists", function(){
            var drug = {name: "Paracetamol 200mg", dosageForm: {display: "Tablet"}};
            var searchTerm = "para";
            var drugSearchResult = new Bahmni.Clinical.DrugSearchResult(drug, searchTerm);

            var value = drugSearchResult.getValue();

            expect(value).toBe("Paracetamol 200mg (Tablet)");
        });

        it("should return the only name when form does not exists", function(){
            var drug = {name: "Paracetamol 200mg", dosageForm: null};
            var searchTerm = "para";
            var drugSearchResult = new Bahmni.Clinical.DrugSearchResult(drug, searchTerm);

            var value = drugSearchResult.getValue();

            expect(value).toBe("Paracetamol 200mg");
        });
    })
});