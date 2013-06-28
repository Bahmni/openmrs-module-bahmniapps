'use strict';

angular.module('registration.patient.models')
    .factory('Preferences', ['$http', '$rootScope', function() {
      return {
          centerID: "GAN",
          hasOldIdentifier: false
      };
}]);