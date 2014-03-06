'use strict';

angular.module('opd.consultation')
  .service('urlHelper', ['$route', function ($route) {
    this.getPatientUrl = function () {
    	return '/patient/' + $route.current.params.patientUuid;
    };

	this.getConsultationUrl = function() {
		return this.getPatientUrl() + '/consultation';
	}

    this.getVisitUrl = function(visitUuid) {
    	return this.getPatientUrl() + '/visit/' + visitUuid;
    }
}]);