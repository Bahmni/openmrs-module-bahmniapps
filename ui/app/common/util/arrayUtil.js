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
    }
};