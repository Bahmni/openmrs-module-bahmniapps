describe("Observation Value Mapper", function () {
    it("should return date value", function() {
        var obs = {type: "Date", value: "2015-12-19", concept: {}};
        var mapper = new Bahmni.Common.Domain.ObservationValueMapper();
        expect(mapper.map(obs)).toBe("19-Dec-2015");
    });

    it("should return datetime value", function() {
        var obs = {type: "Datetime", value: "December 5, 2015 04:02:45 PM IST", concept: {}};
        var mapper = new Bahmni.Common.Domain.ObservationValueMapper();
        expect(mapper.map(obs)).toBe("05 Dec 2015, 04:02 PM");
    });

    it("should return multiselect values", function() {
        var obs = {type: "N/A", concept: {}, isMultiSelect: true, getValues: function() {return ["A", "B"]}};
        var mapper = new Bahmni.Common.Domain.ObservationValueMapper();
        expect(mapper.map(obs)).toEqual(["A", "B"]);
    });

    it("should return coded value", function() {
        var obs = {type: "Coded", value: {name: "Bahmni"}, concept: {}};
        var mapper = new Bahmni.Common.Domain.ObservationValueMapper();
        expect(mapper.map(obs)).toBe("Bahmni");
    });

    it("should return coded value when value has no name", function() {
        var obs = {type: "Coded", value: {test: "Bahmni"}, concept: {}};
        var mapper = new Bahmni.Common.Domain.ObservationValueMapper();
        expect(mapper.map(obs)).toEqual({test: "Bahmni"});
    });

    it("should return value name when value is of type object", function() {
        var obs = {type: "N/A", value: {name: "Bahmni"}, concept: {}};
        var mapper = new Bahmni.Common.Domain.ObservationValueMapper();
        expect(mapper.map(obs)).toEqual("Bahmni");
    });
});