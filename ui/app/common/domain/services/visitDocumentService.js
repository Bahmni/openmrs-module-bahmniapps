'use strict';

angular.module('bahmni.common.domain')
  .service('visitDocumentService', ['$http', function ($http) {
    this.save = function (visitDocument) {
        var url =  Bahmni.Common.Constants.RESTWS_V1 + "/bahmnicore/visitDocument";
          return $http.post(url, visitDocument);
    };
    this.saveFile = function (file, patientUuid, encounterTypeName) {
        var searchStr = ";base64";
        var format = file.split(searchStr)[0].split("/")[1];
        var url = Bahmni.Common.Constants.RESTWS_V1 + "/bahmnicore/visitDocument/uploadImage";
        return $http.post(url, {
            image: file.substring(file.indexOf(searchStr) + searchStr.length, file.length),
            format: format,
            patientUuid: patientUuid,
            encounterTypeName: encounterTypeName
        }, {
            withCredentials: true,
            headers: {"Accept": "text/plain", "Content-Type": "application/json"}
        });
    };
}]);