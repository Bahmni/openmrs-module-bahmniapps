'use strict';

angular.module('bahmni.registration')
    .factory('Preferences', ['$http', '$rootScope', function() {
      return {
          hasOldIdentifier: false
      };
}]);