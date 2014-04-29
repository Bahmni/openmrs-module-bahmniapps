'use strict';

Bahmni.Common.Util.ArrayUtil = {
    chunk: function(array, chunkSize) {
        var chunks = [];
        for (var i = 0; i < array.length; i += chunkSize) chunks.push(array.slice(i, i + chunkSize));
        return chunks;
    },

    removeItem: function(array, item) {
        var index = array.indexOf(item);
        if(index !== -1) {
            array.splice(index, 1)
        }
    },

    clone: function(array) {
    	return array.slice(0);
    },

    flatten: function(items, propertyName){
        return items.reduce(function(flattenedValues, item){
            return flattenedValues.concat(item[propertyName] || []);
        }, []);        
    },

    sortReverse: function(array, field){
        if(!array) return [];
        return array.sort(function(first, second) { return first[field] > second[field] ? -1: 1; });
    },
    
    sort: function(array, field){
        if(!array) return [];
        return array.sort(function(first, second) { return first[field] < second[field] ? -1: 1; });
    }
};