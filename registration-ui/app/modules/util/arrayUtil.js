'use strict';

angular.module('registration.util')
    .factory('arrayUtil', [function () {
		var chunk = function(array, chunkSize) {
		    var chunks = [];
		    for (var i = 0; i<array.length; i+=chunkSize)
		        chunks.push(array.slice(i, i+chunkSize));
		    return chunks;
		}

        return {
            chunk: chunk
        }
    }]
 );