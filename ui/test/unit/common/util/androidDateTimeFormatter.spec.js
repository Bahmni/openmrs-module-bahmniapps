describe("getDateWithoutTime", function() {
    it("should return date without time, in MM-DD-YYYY format",function(){
        expect(Bahmni.Common.Util.DateTimeFormatter.getDateWithoutTime(new Date('2016', '7', '15', '12','30','25'))).toBe('08-15-2016');
        expect(Bahmni.Common.Util.DateTimeFormatter.getDateWithoutTime(new Date("2016-05-19"))).toBe('05-19-2016');
    });

    it("should return null if date provided is null", function() {
        expect(Bahmni.Common.Util.DateTimeFormatter.getDateWithoutTime(null)).toBe(null);
    });
});