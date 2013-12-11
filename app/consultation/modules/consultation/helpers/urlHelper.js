'use strict';

angular.module('opd.consultation.helpers')
  .service('urlHelper', ['$route', function ($route) {
    this.getPatientUrl = function () {
    	return '/patient/' + $route.current.params.patientUuid;
    };

    this.getVisitUrl = function(visitUuid) {
    	return this.getPatientUrl() + '/visit/' + visitUuid;
    }
}]);