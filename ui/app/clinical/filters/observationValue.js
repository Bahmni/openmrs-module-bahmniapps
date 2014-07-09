angular.module('bahmni.clinical')
.filter('observationValue', function ($filter) {
    return function(obs) {
        if(obs.concept.dataType === 'Date') {
            return $filter('date')(obs.value, 'd-MMM-yyyy');
        } 
        if(obs.concept.dataType === 'Coded') {
            return obs.value ? (obs.value.name ? obs.value.name : obs.value) : "";
        } 
        return obs.value;
    }
});