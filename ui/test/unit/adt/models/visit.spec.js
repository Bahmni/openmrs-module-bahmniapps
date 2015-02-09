describe('Visit', function () {

    describe("isAdmitted", function() {
        it("should not be admitted is not ADMISSION encounter", function() {
            var visit = {"encounters": [{encounterType: {name: "IPD"}}]};

            visit = new Bahmni.ADT.Visit(visit);
            expect(visit.isAdmitted()).toBe(false);
        });

        it("should be admitted if last encounters is of type ADMISSION", function () {
            var visit = {
                "encounters": [
                    {encounterType: {name: "ADMISSION"}},
                    {encounterType: {name: "DISCHARGE"}, voided: true},
                    {encounterType: {name: "IPD"}},
                ]
            };

            visit = new Bahmni.ADT.Visit(visit);
            expect(visit.isAdmitted()).toBe(true);
        });

        it("should not be admitted if already discharged", function () {
            var visit = {
                "encounters": [
                    {encounterType: {name: "ADMISSION"}},
                    {encounterType: {name: "DISCHARGE"}},
                ]
            };

            visit = new Bahmni.ADT.Visit(visit);
            expect(visit.isAdmitted()).toBe(false);
        });
    })

    describe("isDischarged", function() {
        it("should not be discharged is not DISCHARGE encounter", function() {
            var visit = {"encounters": [{encounterType: {name: "IPD"}}]};

            visit = new Bahmni.ADT.Visit(visit);
            expect(visit.isDischarged()).toBe(false);
        });

        it("should be admitted if last encounters is of type DISCHARGE", function () {
            var visit = {
                "encounters": [
                    {encounterType: {name: "ADMISSION"}},
                    {encounterType: {name: "DISCHARGE"}},
                ]
            };

            visit = new Bahmni.ADT.Visit(visit);
            expect(visit.isDischarged()).toBe(true);
        });

        it("should not be discharged if already admitted", function () {
            var visit = {
                "encounters": [
                    {encounterType: {name: "ADMISSION"}},
                    {encounterType: {name: "DISCHARGE"}, voided: true},
                ]
            };

            visit = new Bahmni.ADT.Visit(visit);
            expect(visit.isDischarged()).toBe(false);
        });
    })

    it("should return all encounters", function() {
            var visit = {
                "encounters": [
                    {encounterType: {name: "ADMISSION"}, voided: true},
                    {encounterType: {name: "DISCHARGE"}, voided: false},
                ]
            };

            visit = new Bahmni.ADT.Visit(visit);
            expect(visit.getEncounters(false).length).toEqual(1);
            expect(visit.getEncounters(true).length).toEqual(2);
    })

});