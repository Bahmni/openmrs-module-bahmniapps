'use strict';

angular.module('bahmni.clinical')
  .service('urlHelper', ['$stateParams', function ($stateParams) {
      this.getPatientUrl = function () {
          return '/patient/' + $stateParams.patientUuid + '/dashboard';
      };

      this.getConsultationUrl = function () {
          return this.getPatientUrl() + '/consultation';
      };

      this.getVisitUrl = function (visitUuid) {
          return this.getPatientUrl() + '/visit/' + visitUuid;
      };
  }]);
