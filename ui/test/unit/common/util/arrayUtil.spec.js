describe('ArrayUtil', function () {
    var arrayUtil = Bahmni.Common.Util.ArrayUtil;

    describe('sortReverse', function() {
        it('should sort in reverse order of field', function () {
            var array = [
                {"date":new Date("2001-01-01"), "value":6},
                {"date":new Date("2005-01-01"), "value":2},
                {"date":new Date("2003-01-01"), "value":5},
                {"date":new Date("2014-01-01"), "value":1}
            ];
            arrayUtil.sortReverse(array,'value');
            expect(array.length).toBe(4);
            expect(array[0].value).toBe(6);
            expect(array[1].value).toBe(5);
            expect(array[2].value).toBe(2);
            expect(array[3].value).toBe(1);

            arrayUtil.sortReverse(array,'date');
            expect(array.length).toBe(4);
            expect(array[0].value).toBe(1);
            expect(array[1].value).toBe(2);
            expect(array[2].value).toBe(5);
            expect(array[3].value).toBe(6);
        });

        it('should sort reverse by value and reatin order of items with same value', function () {
            var array = [
                {name: 'x', "value": 7},
                {name: 'y', "value": 6},
                {name: 'z', "value": 6},
            ];

            arrayUtil.sortReverse(array,'value');

            expect(array.length).toBe(3);
            expect(array[0].name).toBe('x');
            expect(array[1].name).toBe('y');
            expect(array[2].name).toBe('z');
        });
    });

    describe('sort', function() {
        it('should sort ascending by value and reatin order of items with same value', function () {
            var array = [
                {name: 'x', "value": 7},
                {name: 'y', "value": 6},
                {name: 'z', "value": 6},
            ];

            arrayUtil.sort(array,'value');

            expect(array.length).toBe(3);
            expect(array[0].name).toBe('y');
            expect(array[1].name).toBe('z');
            expect(array[2].name).toBe('x');
        });
    });
});