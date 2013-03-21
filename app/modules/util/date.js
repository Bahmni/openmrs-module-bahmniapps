'use strict';

angular.module('resources.date', [])
    .factory('date', [function () {
        var now = function(){
            return new Date();
        }

        return {
            now: now
        }
    }]);