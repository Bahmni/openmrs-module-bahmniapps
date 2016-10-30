'use strict';

angular.module('bahmni.common.domain')
  .service('visitDocumentService', ['$http', function ($http) {
      this.save = function (visitDocument) {
          var url = Bahmni.Common.Constants.RESTWS_V1 + "/bahmnicore/visitDocument";
          return $http.post(url, visitDocument);
      };
      this.saveFile = function (file, patientUuid, encounterTypeName, fileName, fileType) {
          var searchStr = ";base64";
          var format;
          if (fileType === "video") {
              format = _.last(_.split(fileName, "."));
          } else {
              format = file.split(searchStr)[0].split("/")[1];
          }
          var url = Bahmni.Common.Constants.RESTWS_V1 + "/bahmnicore/visitDocument/uploadDocument";
          return $http.post(url, {
              content: file.substring(file.indexOf(searchStr) + searchStr.length, file.length),
              format: format,
              patientUuid: patientUuid,
              encounterTypeName: encounterTypeName,
              fileType: fileType || "file"
          }, {
              withCredentials: true,
              headers: {"Accept": "application/json", "Content-Type": "application/json"}
          });
      };
  }]);
