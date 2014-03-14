'use strict';

angular.module('opd.documentupload')
  .service('visitDocumentService', ['$http', function ($http) {
    this.save = function (visitDocument) {
        var url = "/openmrs/ws/rest/v1/bahmnicore/visitDocument";
          return $http.post(url, visitDocument);
    };
}]);