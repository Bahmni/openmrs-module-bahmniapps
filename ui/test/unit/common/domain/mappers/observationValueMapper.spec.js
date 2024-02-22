describe("Observation Value Mapper", function () {
    var mapper = Bahmni.Common.Domain.ObservationValueMapper;
    it("should return date value", function() {
        var obs = {type: "Date", value: "2015-12-19", concept: {}};
        expect(mapper.map(obs)).toBe("19-Dec-2015");
    });

    it("should return datetime value", function() {
        var obs = {type: "Datetime", value: "2015-12-05 16:02:00", concept: {}};
        expect(mapper.map(obs)).toBe("05 Dec 2015 4:02 pm");
    });

    it("should return multiselect values", function() {
        var obs = {type: "N/A", concept: {}, isMultiSelect: true, getValues: function() {return ["A", "B"]}};
        expect(mapper.map(obs)).toEqual("A, B");
    });

    it("should return coded value", function() {
        var obs = {type: "Coded", value: {name: "Bahmni"}, concept: {}};
        expect(mapper.map(obs)).toBe("Bahmni");
    });

    it("should return coded value when value has no name", function() {
        var obs = {type: "Coded", value: {test: "Bahmni"}, concept: {}};
        expect(mapper.map(obs)).toEqual({test: "Bahmni"});
    });

    it("should return value name when value is of type object", function() {
        var obs = {type: "N/A", value: {name: "Bahmni"}, concept: {}};
        expect(mapper.map(obs)).toEqual("Bahmni");
    });

    it("should return Yes when type is boolean and value is true", function() {
        var obs = {type: "Boolean", value: true, concept: {}};
        expect(mapper.map(obs)).toEqual("Yes");
    });
    it("should return No when type is boolean and value is false", function() {
        var obs = {type: "Boolean", value: false, concept: {}};
        expect(mapper.map(obs)).toEqual("No");
    });
});