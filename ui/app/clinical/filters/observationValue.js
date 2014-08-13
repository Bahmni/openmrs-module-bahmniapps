angular.module('bahmni.clinical')
.filter('observationValue', function ($filter) {
    return function(obs) {
        var type = obs.concept.dataType ? obs.concept.dataType : obs.type;
        if(type === 'Date') {
            return $filter('date')(obs.value, 'd-MMM-yyyy');
        } 
        if(type === 'Coded') {
            return obs.value ? (obs.value.name ? obs.value.name : obs.value) : "";
        } 
        return obs.value;
    }
});