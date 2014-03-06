angular.module('opd.consultation')
.filter('observationValue', function ($filter) {
    return function(obs) {
        if(obs.concept.dataType === 'Date') {
            return $filter('date')(obs.value, 'd-MMM-yyyy');
        } 
        if(obs.concept.dataType === 'Coded') {
            return obs.value ? obs.value.name : "";
        } 
        return obs.value;
    }
});