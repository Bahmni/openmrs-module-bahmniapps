'use strict';

describe('Result Grouper', function() {
    it('should be able to group a list of objects based on a particular parameter', function() {
        var input = [{key: 'a', value: 'something'}, {key: 'a', value: 'something else'}, {key: 'b', value: 'something completely different'}];
        var getKey = function(data){return data.key;}

        var transformedObject = new Bahmni.Clinical.ResultGrouper().group(input, getKey, 'nameForArray');

        expect(transformedObject.length).toBe(2);
        var withKeyA = transformedObject.filter(function(obj){return obj['key'] === 'a';})[0];
        expect(withKeyA['nameForArray'].length).toBe(2);

        var withKeyB = transformedObject.filter(function(object){return object.key === 'b';})[0];
        expect(withKeyB['nameForArray'].length).toBe(1);
    });
});