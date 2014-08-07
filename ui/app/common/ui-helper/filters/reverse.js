angular.module('bahmni.common.uiHelper').filter('reverse', function() {
    return function(items) {
        return items.slice().reverse();
    };
});