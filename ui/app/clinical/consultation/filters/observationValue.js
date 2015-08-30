angular.module('bahmni.clinical')
.filter('observationValue', function ($filter) {
    return function(obs) {
        return Bahmni.Common.Domain.ObservationValueMapper.map(obs);
    }
});