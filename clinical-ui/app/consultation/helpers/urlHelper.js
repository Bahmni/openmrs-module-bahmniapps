'use strict';

angular.module('opd.consultation')
  .service('urlHelper', ['$stateParams', function ($stateParams) {
    this.getPatientUrl = function () {
    	return '/patient/' + $stateParams.patientUuid;
    };

	this.getConsultationUrl = function() {
		return this.getPatientUrl() + '/consultation';
	}

    this.getVisitUrl = function(visitUuid) {
    	return this.getPatientUrl() + '/visit/' + visitUuid;
    }
}]);