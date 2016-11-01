'use strict';

angular.module('bahmni.clinical')
.filter('observationValue', function () {
    return function (obs) {
        return Bahmni.Common.Domain.ObservationValueMapper.map(obs);
    };
});
