'use strict';

angular.module('bahmni.common.domain')
  .service('visitDocumentService', ['$http', function ($http) {
    this.save = function (visitDocument) {
        var url = "/openmrs/ws/rest/v1/bahmnicore/visitDocument";
          return $http.post(url, visitDocument);
    };
    this.saveFile = function (file, patientUuid, encounterTypeName) {
        var format = file.split(";base64")[0].split("/")[1];
        var url = "/openmrs/ws/rest/v1/bahmnicore/visitDocument/uploadImage";
        return $http.post(url, {
            image: file.replace(/data:.*\/.*;base64/, ""),
            format: format,
            patientUuid: patientUuid,
            encounterTypeName: encounterTypeName
        }, {
            withCredentials: true,
            headers: {"Accept": "text/plain", "Content-Type": "application/json"}
        });
    };
}]);