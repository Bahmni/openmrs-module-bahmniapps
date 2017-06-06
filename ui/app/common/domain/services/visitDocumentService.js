'use strict';

angular.module('bahmni.common.domain')
    .service('visitDocumentService', ['$http', 'configurationService', 'auditLogService', function ($http, configurationService, auditLogService) {
        var removeVoidedDocuments = function (documents) {
            documents.forEach(function (document) {
                if (document.voided) {
                    var url = Bahmni.Common.Constants.RESTWS_V1 + "/bahmnicore/visitDocument?filename=" + document.image;
                    $http.delete(url, {withCredentials: true});
                }
            });
        };

        var log = function (patientUuid, visitUuid, visitType) {
            configurationService.getConfigurations(['enableAuditLog']).then(function (result) {
                if (result.enableAuditLog) {
                    var params = {};
                    params.patientUuid = patientUuid;
                    params.eventType = Bahmni.Common.AuditLogEventDetails["OPEN_VISIT"].eventType;
                    params.message = Bahmni.Common.AuditLogEventDetails["OPEN_VISIT"].message + '~' +
                                     JSON.stringify({visitUuid: visitUuid, visitType: visitType});
                    params.module = "document upload";
                    auditLogService.auditLog(params);
                }
            });
        };

        this.save = function (visitDocument, visitType) {
            var url = Bahmni.Common.Constants.RESTWS_V1 + "/bahmnicore/visitDocument";
            var isNewVisit = !visitDocument.visitUuid;
            removeVoidedDocuments(visitDocument.documents);
            return $http.post(url, visitDocument).then(function (response) {
                if (isNewVisit) {
                    log(visitDocument.patientUuid, response.data.visitUuid, visitType);
                }
                return response;
            });
        };
        this.saveFile = function (file, patientUuid, encounterTypeName, fileName, fileType) {
            var searchStr = ";base64";
            var format = file.split(searchStr)[0].split("/")[1];
            if (fileType === "video") {
                format = _.last(_.split(fileName, "."));
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

        this.getFileType = function (fileType) {
            var pdfType = "pdf";
            var imageType = "image";
            if (fileType.indexOf(pdfType) !== -1) {
                return pdfType;
            }
            if (fileType.indexOf(imageType) !== -1) {
                return imageType;
            }
            return "not_supported";
        };
    }]);
