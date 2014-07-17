'use strict';

angular.module('bahmni.common.domain')
  .service('visitDocumentService', ['$http', function ($http) {
    this.save = function (visitDocument) {
        var url = "/openmrs/ws/rest/v1/bahmnicore/visitDocument";
          return $http.post(url, visitDocument);
    };
    this.saveImage = function (image, patientUuid, encounterTypeName) {
        var format = image.split(";base64")[0].split("data:image/")[1];
        var url = "/openmrs/ws/rest/v1/bahmnicore/visitDocument/uploadImage";
        return $http.post(url, {
            image: image.replace(/data:image\/.*;base64/, ""),
            format: format,
            patientUuid: patientUuid,
            encounterTypeName: encounterTypeName
        });
    };
}]);