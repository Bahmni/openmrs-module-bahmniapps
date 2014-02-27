angular.module('opd.consultation')
.filter('observationValue', function ($filter) {
    return function(obs) {
        if(obs.concept.dataType === 'Date') {
            return $filter('date')(obs.value, 'd-MMM-yyyy');
        } 
        return obs.value;
    }
});