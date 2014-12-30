'use strict';

angular.module('bahmni.clinical')
.filter('boolean', function() {
    return function(value) {
        if(value === true) {
            return "Yes";
        } else if(value === false) {
            return "No";
        }
        return value;
    };
});