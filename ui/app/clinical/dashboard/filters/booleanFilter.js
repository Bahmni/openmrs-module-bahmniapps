angular.module('bahmni.clinical')
.filter('boolean', function($filter) {
    return function(value) {
        if(value === true) {
            return "Yes";
        } else if(value === false) {
            return "No";
        }
        return value;
    };
});