describe('ArrayUtil', function () {
    var arrayUtil = Bahmni.Common.Util.ArrayUtil;

    it('should sort in reverse order of field', function () {
        var array = [
            {"date":new Date("1-1-2001"), "value":6},
            {"date":new Date("1-1-2005"), "value":2},
            {"date":new Date("1-1-2003"), "value":5},
            {"date":new Date("1-1-2014"), "value":1}
        ];
        arrayUtil.sortInReverseOrderOfField(array,'value');
        expect(array.length).toBe(4);
        expect(array[0].value).toBe(6);
        expect(array[1].value).toBe(5);
        expect(array[2].value).toBe(2);
        expect(array[3].value).toBe(1);

        arrayUtil.sortInReverseOrderOfField(array,'date');
        expect(array.length).toBe(4);
        expect(array[0].value).toBe(1);
        expect(array[1].value).toBe(2);
        expect(array[2].value).toBe(5);
        expect(array[3].value).toBe(6);
    });
});