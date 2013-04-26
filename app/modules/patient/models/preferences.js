'use strict';

angular.module('resources.preferences', [])
    .factory('Preferences', ['$http', '$rootScope', function() {
      return {
          centerID: "GAN",
          hasOldIdentifier: false
      };
}]);